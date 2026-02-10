package SkillMatch.service;

import SkillMatch.dto.JobResponseDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.jsoup.HttpStatusException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExternalJobService {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
    private static final int CONNECT_TIMEOUT_MS = 120000;

    private static final String GAMJOBS_URL = "https://gamjobs.com/jobs/";
    private static final String WAVE_URL = "https://www.wave.com/en/careers/";
    private static final String IOM_GAMBIA_URL = "https://gambia.iom.int/careers";
    private static final String MOJ_GAMBIA_URL = "https://moj.gov.gm/vcancies/";
    private static final String UNJOBS_GAMBIA_URL = "https://unjobs.org/duty_stations/gambia";

    // Fallback Logos
    private static final String UNJOBS_LOGO = "https://media.licdn.com/dms/image/v2/C4E0BAQHQ1DD92ZSnkA/company-logo_200_200/company-logo_200_200/0/1670422173816?e=2147483647&v=beta&t=ZVwp-54BrQBhzPgiggGGnLE_iGE99WwvOdcFMKkRqIU";
    
    private static final DateTimeFormatter GAMJOBS_DATE_FORMAT = DateTimeFormatter.ofPattern("MMMM d, yyyy", Locale.ENGLISH);

    private Document safelyFetchDocument(String url) {
        return safelyFetchDocument(url, "https://www.google.com/");
    }

    private Document safelyFetchDocument(String url, String referer) {
        try {
            // Modern Chrome User Agent
            String ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
            
            return Jsoup.connect(url)
                    .userAgent(ua)
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .header("Cache-Control", "no-cache")
                    .header("Referer", referer != null ? referer : "https://www.google.com/")
                    .header("Upgrade-Insecure-Requests", "1")
                    .header("Sec-Fetch-Dest", "document")
                    .header("Sec-Fetch-Mode", "navigate")
                    .header("Sec-Fetch-Site", "same-origin")
                    .header("Sec-Fetch-User", "?1")
                    .followRedirects(true)
                    .ignoreHttpErrors(false)
                    .timeout(CONNECT_TIMEOUT_MS)
                    .get();
        } catch (HttpStatusException e) {
            log.warn("Target blocked or missing (HTTP {}): {}", e.getStatusCode(), url);
        } catch (Exception e) {
            log.error("Failed to fetch document from {}: {}", url, e.getMessage());
        }
        return null;
    }

    public List<JobResponseDTO> fetchGamjobs() {
        log.info("Fetching jobs from Gamjobs...");
        List<JobResponseDTO> jobs = new ArrayList<>();
        Document doc = safelyFetchDocument(GAMJOBS_URL);
        if (doc == null) {
            log.warn("Gamjobs landing page returned null. Check if blocked.");
            return jobs;
        }

        // Expanded selectors for Gamjobs
        Elements jobElements = doc.select("article, .noo-job-item, .job-item, .job_listing, .job-list-item, .loop-item, div.item-job");
        log.info("Found {} candidate job elements on Gamjobs", jobElements.size());

        if (jobElements.isEmpty()) {
            // Fallback: search for potential job links directly
            jobElements = doc.select("h3 a[href*=/jobs/], h2 a[href*=/jobs/], .job-title a");
            log.info("Fallback search found {} potential job links on Gamjobs", jobElements.size());
        }

        for (Element el : jobElements) {
            // Priority 1: data-url attribute
            String url = el.attr("data-url");
            
            // Priority 2: job-details-link or standard links
            if (url.isEmpty()) {
                Element linkEl = el.selectFirst(".job-details-link, h3.loop-item-title a, a[href*=/jobs/], a[href*=/job/]");
                if (linkEl != null) url = linkEl.absUrl("href");
            }

            if (!url.isEmpty()) {
                if (url.contains("/employers/") || url.contains("/job-category/") || url.contains("/job-location/") || url.equals(GAMJOBS_URL)) continue;

                log.info("Processing Gamjobs link: {}", url);
                
                // Extract list-view data first (often more reliable/consistent)
                String listLogo = firstAttr(el, "src", ".item-featured img", ".company-logo img", "img.job-logo");
                String listCompany = firstText(el, ".job-company", ".company", ".employer");
                Element compUrlEl = el.selectFirst(".job-company a, a[href*=/employers/]");
                String listCompUrl = compUrlEl != null ? compUrlEl.absUrl("href") : "";

                JobResponseDTO detail = fetchGamjobsJobDetail(url);
                if (detail != null) {
                    // Merge list data if detail is missing them
                    if (detail.getEmployer() != null) {
                        if (detail.getEmployer().getLogo().isEmpty() && listLogo != null) detail.getEmployer().setLogo(listLogo);
                        if (detail.getEmployer().getWebsite().isEmpty() && !listCompUrl.isEmpty()) detail.getEmployer().setWebsite(listCompUrl);
                        if (detail.getEmployer().getName().equals("N/A") && listCompany != null) detail.getEmployer().setName(listCompany);
                    }
                    jobs.add(detail);
                } else {
                    String title = firstText(el, "h3", ".job-title", "h2");
                    if (title == null) title = "Unknown Title";
                    
                    jobs.add(JobResponseDTO.builder()
                            .id(url).title(title).description("Details available at source.")
                            .employer(JobResponseDTO.EmployerInfo.builder()
                                    .name(listCompany != null ? listCompany : "Unknown")
                                    .logo(listLogo != null ? listLogo : "")
                                    .website(listCompUrl)
                                    .build())
                            .locationType("ONSITE").url(url).postedAt(LocalDateTime.now()).source("Gamjobs").build());
                }
                try { Thread.sleep(2000 + new Random().nextInt(2000)); } catch (InterruptedException ignored) {}
            }
        }
        return jobs;
    }

    private JobResponseDTO fetchGamjobsJobDetail(String jobUrl) {
        Document doc = safelyFetchDocument(jobUrl, GAMJOBS_URL);
        if (doc == null) return null;

        Element titleEl = doc.selectFirst("h1.entry-title, h1.page-title, h1, .job-title, .entry-title, .loop-item-title a");
        String title = (titleEl != null) ? titleEl.text().trim() : "Unknown Title";

        // Company detection
        String company = firstText(doc, ".job-company span", ".company", ".job-company", ".job-company span", "a[href*=/employers/]", ".employer-name");
        Element companyUrlEl = doc.selectFirst(".job-company a, a[href*=/employers/], .job-company a, .company-name a");
        String companyUrl = (companyUrlEl != null) ? companyUrlEl.absUrl("href") : "";

        String location = firstText(doc, ".job-location a", ".job-location", ".location", ".job_listing-location", "a[href*=/job-location/]", ".location-name");
        String postedText = firstText(doc, ".job-date__closing", ".job-date", ".job-date__posted", "time.entry-date", "time", ".date-posted", ".posted-date", ".post-date");
        
        Element descEl = doc.selectFirst("div[itemprop=description], .job_description, .job-description, .entry-content, #content, .description");
        String description = (descEl != null) ? descEl.html().trim() : "";

        String logo = firstAttr(doc, "src", ".item-featured img", "img.company-logo", ".company-logo img", "img[itemprop=logo]", ".logo img", ".job-company-logo img", ".employer-logo img", ".employer-profile img");
        
        // If logo missing or looks like a placeholder, attempt one-level-deep extraction from employer profile
        if ((logo == null || logo.isBlank() || logo.contains("placeholder")) && !companyUrl.isBlank()) {
            try {
                Document compDoc = safelyFetchDocument(companyUrl, jobUrl);
                if (compDoc != null) {
                    // Look for profile picture specifically on the employer page
                    String compLogo = firstAttr(compDoc, "src", 
                        ".employer-profile-picture img", 
                        ".profile-picture img", 
                        ".company-brand-image img",
                        ".employer-logo img", 
                        ".company-logo img", 
                        "img[itemprop=logo]",
                        ".noo-company-logo img"
                    );
                    if (compLogo != null) logo = compLogo;
                }
            } catch (Exception ignored) {}
        }

        return JobResponseDTO.builder()
                .id(jobUrl).title(title).description(description)
                .employer(JobResponseDTO.EmployerInfo.builder()
                        .name(company != null ? company : "N/A")
                        .logo(logo != null ? logo : "")
                        .website(companyUrl)
                        .build())
                .locationType(location).url(jobUrl).postedAt(parseGamjobsDate(postedText)).source("Gamjobs").build();
    }

    public List<JobResponseDTO> fetchWaveJobs() {
        log.info("Fetching jobs from Wave...");
        List<JobResponseDTO> jobs = new ArrayList<>();
        Document doc = safelyFetchDocument(WAVE_URL);
        if (doc == null) return jobs;

        List<Element> jobLinks = doc.select("a[href*=/en/careers/job/]");
        for (Element link : jobLinks) {
            String url = link.absUrl("href");
            String contextText = link.parent() != null ? link.parent().text() : "";
            if (contextText.toLowerCase().contains("gambia")) {
                JobResponseDTO detail = fetchWaveJobDetail(url);
                if (detail != null) jobs.add(detail);
                try { Thread.sleep(500); } catch (InterruptedException ignored) {}
            }
        }
        return jobs;
    }

    private JobResponseDTO fetchWaveJobDetail(String jobUrl) {
        Document doc = safelyFetchDocument(jobUrl);
        if (doc == null) return null;

        String title = firstText(doc, "h1");
        Element content = doc.selectFirst("article, main, .content");
        return JobResponseDTO.builder()
                .id(jobUrl).title(title).description(content != null ? content.html() : doc.body().html())
                .employer(JobResponseDTO.EmployerInfo.builder()
                        .name("Wave")
                        .logo("https://play-lh.googleusercontent.com/NgAdQMq9Mu2NTJredx6COxScVB3tp153h_bVKQTXUt9Aou0Lz1PfffaQt5jFN9jlBfo")
                        .build())
                .locationType("ONSITE").url(jobUrl).postedAt(LocalDateTime.now()).source("Wave").build();
    }

    public List<JobResponseDTO> fetchIomGambiaJobs() {
        log.info("Fetching jobs from IOM Gambia...");
        List<JobResponseDTO> jobs = new ArrayList<>();
        Document doc = safelyFetchDocument(IOM_GAMBIA_URL);
        if (doc == null) return jobs;

        Elements rows = doc.select("table tr, .view-content tr");
        for (Element row : rows) {
            Elements cols = row.select("td, th");
            if (cols.size() >= 4) {
                Element titleLink = cols.get(0).selectFirst("a");
                if (titleLink == null) continue;
                String title = titleLink.text().trim();
                String pdfUrl = titleLink.absUrl("href");
                String dutyStation = cols.get(1).text().trim();
                String grade = cols.get(2).text().trim();
                String closingDate = cols.get(3).text().trim();

                String description = String.format(
                    "<div class='iom-job-container'><h3>IOM - Vacancy</h3><p><strong>Position:</strong> %s</p><p><strong>Grade:</strong> %s</p><p><strong>Duty Station:</strong> %s</p><p><strong>Closing Date:</strong> %s</p></div>",
                    title, grade, dutyStation, closingDate
                );

                jobs.add(JobResponseDTO.builder().id(pdfUrl).title(title).description(description)
                        .employer(JobResponseDTO.EmployerInfo.builder()
                                .name("IOM Gambia")
                                .logo("https://gambia.iom.int/sites/g/files/tmzbdl141/files/iom_logo.png")
                                .build())
                        .locationType("ONSITE").url(pdfUrl).postedAt(LocalDateTime.now()).source("IOMGambia").build());
            }
        }
        return jobs;
    }

    public List<JobResponseDTO> fetchMojJobs() {
        log.info("Fetching jobs from MOJ Gambia...");
        List<JobResponseDTO> jobs = new ArrayList<>();
        Document doc = safelyFetchDocument(MOJ_GAMBIA_URL);
        if (doc == null) {
            doc = safelyFetchDocument("https://moj.gov.gm/category/contract-job/");
            if (doc == null) return jobs;
        }

        String siteLogo = firstAttr(doc, "src", ".logo img", "img[src*=logo]", "header img");
        Elements links = doc.select("a[href*=.pdf], .entry-content a, article h2 a, h3 a");
        for (Element link : links) {
            String title = link.text().trim();
            String url = link.absUrl("href");
            if (title.length() > 5 && (url.toLowerCase().contains(".pdf") || title.toLowerCase().contains("vacancy") || title.toLowerCase().contains("recruitment"))) {
                String description = String.format("<div class='moj-job-container'><h3>Ministry of Justice - Vacancy</h3><p><strong>Position:</strong> %s</p></div>", title);
                jobs.add(JobResponseDTO.builder().id(url).title(title).description(description)
                        .employer(JobResponseDTO.EmployerInfo.builder()
                                .name("Ministry of Justice, The Gambia")
                                .logo(siteLogo != null ? siteLogo : "")
                                .build())
                        .locationType("ONSITE").url(url).postedAt(LocalDateTime.now()).source("MOJGambia").build());
            }
        }
        return jobs;
    }

    public List<JobResponseDTO> fetchUnJobs() {
        log.info("Fetching jobs from UNJobs (Gambia)...");
        List<JobResponseDTO> jobs = new ArrayList<>();
        Document doc = safelyFetchDocument(UNJOBS_GAMBIA_URL);
        if (doc == null) return jobs;

        Elements jobElements = doc.select("div.job");
        for (Element el : jobElements) {
            Element titleLink = el.selectFirst("a.jtitle");
            if (titleLink == null) continue;
            String jobUrl = titleLink.absUrl("href");
            
            JobResponseDTO detail = fetchUnJobDetail(jobUrl);
            if (detail != null) {
                jobs.add(detail);
            } else {
                String title = titleLink.text().trim();
                jobs.add(JobResponseDTO.builder().id(jobUrl).title(title).description(el.html())
                        .employer(JobResponseDTO.EmployerInfo.builder()
                                .name("United Nations / NGO")
                                .logo(UNJOBS_LOGO)
                                .build())
                        .locationType("ONSITE").url(jobUrl).postedAt(LocalDateTime.now()).source("UNJobs").build());
            }
            try { Thread.sleep(2000 + new Random().nextInt(2000)); } catch (InterruptedException ignored) {}
        }
        return jobs;
    }

    private JobResponseDTO fetchUnJobDetail(String jobUrl) {
        Document doc = safelyFetchDocument(jobUrl);
        if (doc == null) return null;

        String title = firstText(doc, "h1", "h2", ".jtitle");
        Element content = doc.selectFirst("#job-details, .job_description, article");
        String logo = firstAttr(doc, "src", ".logo img", "img[src*=logo]");
        return JobResponseDTO.builder()
                .id(jobUrl).title(title).description(content != null ? content.html() : doc.body().html())
                .employer(JobResponseDTO.EmployerInfo.builder()
                        .name("United Nations / NGO")
                        .logo(logo != null ? logo : UNJOBS_LOGO).build())
                .locationType("ONSITE").url(jobUrl).postedAt(LocalDateTime.now()).source("UNJobs").build();
    }

    public List<JobResponseDTO> structureBatchWithAI(List<JobResponseDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) return new ArrayList<>();
        List<String> rawDataList = dtos.stream()
            .map(dto -> String.format("Title: %s\nEmployer: %s\nDescription: %s\nSource: %s", 
                dto.getTitle(), 
                dto.getEmployer() != null ? dto.getEmployer().getName() : "Unknown",
                Jsoup.parse(dto.getDescription()).text(), 
                dto.getSource()))
            .collect(Collectors.toList());

        List<String> jsonResults = geminiService.structureJobDataBatch(rawDataList);
        for (int i = 0; i < dtos.size() && i < jsonResults.size(); i++) {
            applyJsonToDto(dtos.get(i), jsonResults.get(i));
        }
        return dtos;
    }

    private void applyJsonToDto(JobResponseDTO dto, String jsonResult) {
        try {
            JsonNode node = objectMapper.readTree(jsonResult);
            if (node.has("title")) dto.setTitle(node.get("title").asText());
            if (node.has("description")) dto.setDescription(node.get("description").asText());
            if (node.has("industry")) dto.setIndustry(node.get("industry").asText());
            if (node.has("salary")) dto.setSalary(node.get("salary").asText());
            if (node.has("requirements") && node.get("requirements").isArray()) {
                List<String> reqs = new ArrayList<>();
                node.get("requirements").forEach(r -> reqs.add(r.asText()));
                dto.setRequirements(reqs);
            }
            if (node.has("skills") && node.get("skills").isArray()) {
                List<String> skills = new ArrayList<>();
                node.get("skills").forEach(s -> skills.add(s.asText()));
                dto.setSkills(skills);
            }
        } catch (Exception e) { log.error("AI Parse Error", e); }
    }

    private LocalDateTime parseGamjobsDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return LocalDateTime.now();
        try {
            return java.time.LocalDate.parse(dateStr, GAMJOBS_DATE_FORMAT).atStartOfDay();
        } catch (Exception e) { return LocalDateTime.now(); }
    }

    private String firstText(Element doc, String... selectors) {
        for (String selector : selectors) {
            Element el = doc.selectFirst(selector);
            if (el != null && !el.text().isBlank()) return el.text().trim();
        }
        return null;
    }

    private String firstAttr(Element doc, String attribute, String... selectors) {
        for (String selector : selectors) {
            Element el = doc.selectFirst(selector);
            if (el != null) {
                String val = el.attr(attribute);
                if (!val.isBlank()) return el.absUrl(attribute);
            }
        }
        return null;
    }
}
