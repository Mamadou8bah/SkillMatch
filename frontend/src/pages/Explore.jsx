import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, LocateFixed, Search } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PopularJobCard } from '../components/PopularJobCard';
import { apiFetch } from '../utils/api';
import { chatCache } from '../utils/cache';
import '../styles/explore.css';

const getJobSkills = (job) => {
  if (Array.isArray(job?.skills)) return job.skills.filter(Boolean);
  if (Array.isArray(job?.requiredSkills)) {
    return job.requiredSkills.map((s) => (typeof s === 'string' ? s : s?.title)).filter(Boolean);
  }
  return [];
};

const getCompany = (job) => job?.employer?.name || job?.companyName || 'Company';
const getIndustry = (job) => (job?.industry || 'General').trim();
const getLocationTag = (job) => (job?.locationType || 'ONSITE').toUpperCase();
const getLocationText = (job) =>
  (job?.employer?.location || job?.location || job?.city || '').toString().trim();
const DEFAULT_CENTER = { lat: 13.4549, lng: -16.5790 };
const normalize = (value) => (value || '').toString().toLowerCase().trim();

const matchesQuery = (job, query) => {
  const q = normalize(query);
  if (!q) return true;
  const haystacks = [
    job?.title,
    getCompany(job),
    getIndustry(job),
    getLocationText(job),
    getLocationTag(job),
    ...(getJobSkills(job) || [])
  ].map(normalize);
  return haystacks.some((value) => value.includes(q));
};

const haversineKm = (a, b) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
};

const personIcon = L.divIcon({
  className: 'explore-marker-user',
  html: '<div class="dot-user"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

const jobIcon = L.divIcon({
  className: 'explore-marker-job',
  html: '<div class="dot-job"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const ExploreSkeleton = () => (
  <div className="explore-page">
    <div className="explore-skeleton explore-skeleton-hero" />
    <section className="explore-section">
      <div className="explore-skeleton explore-skeleton-head" />
      <div className="explore-skeleton explore-skeleton-meta" />
      <div className="explore-skeleton explore-skeleton-map" />
    </section>
    <section className="explore-section">
      <div className="explore-skeleton explore-skeleton-head" />
      <div className="explore-skeleton-row">
        <div className="explore-skeleton explore-skeleton-card" />
        <div className="explore-skeleton explore-skeleton-card" />
        <div className="explore-skeleton explore-skeleton-card" />
      </div>
    </section>
  </div>
);

export const Explore = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [latestJobs, setLatestJobs] = useState([]);
  const [trendingJobs, setTrendingJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const [geoError, setGeoError] = useState('');
  const [jobCoordinates, setJobCoordinates] = useState({});
  const [isMapLoading, setIsMapLoading] = useState(false);
  const mapElementRef = useRef(null);
  const recoScrollRef = useRef(null);
  const latestScrollRef = useRef(null);
  const mapRef = useRef(null);
  const mapLayersRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported on this device.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => {
        setGeoError('Allow location access to see jobs near you on the map.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 120000 }
    );
  }, []);

  useEffect(() => {
    const load = async () => {
      const cachedLatest = chatCache.get('explore_latest_jobs');
      const cachedTrending = chatCache.get('explore_trending_jobs');
      const cachedPool = chatCache.get('explore_jobs_pool');

      if (Array.isArray(cachedLatest) && cachedLatest.length) setLatestJobs(cachedLatest);
      if (Array.isArray(cachedTrending) && cachedTrending.length) setTrendingJobs(cachedTrending);
      if (Array.isArray(cachedPool) && cachedPool.length) setJobs(cachedPool);
      if ((Array.isArray(cachedLatest) && cachedLatest.length) || (Array.isArray(cachedTrending) && cachedTrending.length)) {
        setIsLoading(false);
      }

      try {
        const requests = [
          apiFetch('/post?page=0&size=120'),
          apiFetch('/post/trending?size=24')
        ];

        const [recentData, trendingData] = await Promise.all(requests);

        let recentJobs = [];
        if (Array.isArray(recentData)) recentJobs = recentData;
        else if (recentData?.content && Array.isArray(recentData.content)) recentJobs = recentData.content;

        const trending = Array.isArray(trendingData) ? trendingData : [];

        const byId = new Map();
        [...trending, ...recentJobs].forEach((job) => {
          if (job?.id != null && !byId.has(job.id)) byId.set(job.id, job);
        });

        const latest = recentJobs.slice(0, 12);
        const trendingList = trending.length ? trending : latest;
        const pool = Array.from(byId.values());

        setLatestJobs(latest);
        setTrendingJobs(trendingList);
        setJobs(pool);

        chatCache.set('explore_latest_jobs', latest);
        chatCache.set('explore_trending_jobs', trendingList);
        chatCache.set('explore_jobs_pool', pool);
      } catch (err) {
        console.error('Explore load failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await apiFetch(`/post/search?title=${encodeURIComponent(query)}`);
        if (Array.isArray(response)) {
          setSearchResults(response);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        const fallback = jobs.filter((job) => matchesQuery(job, query));
        setSearchResults(fallback);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchQuery, jobs]);

  const activeQuery = searchQuery.trim();
  const searchedJobs = useMemo(() => {
    if (!activeQuery) return [];
    const source = searchResults.length ? searchResults : jobs.filter((job) => matchesQuery(job, activeQuery));
    const byId = new Map();
    source.forEach((job) => {
      if (job?.id != null && !byId.has(job.id)) byId.set(job.id, job);
    });
    return Array.from(byId.values());
  }, [activeQuery, searchResults, jobs]);

  const latestView = useMemo(() => {
    if (!activeQuery) return latestJobs;
    return searchedJobs.slice(0, 12);
  }, [activeQuery, latestJobs, searchedJobs]);

  const trendingView = useMemo(() => {
    if (activeQuery) return searchedJobs;
    const pool = trendingJobs.length ? trendingJobs : jobs;
    return pool;
  }, [activeQuery, searchedJobs, trendingJobs, jobs]);

  useEffect(() => {
    const geocodeJobs = async () => {
      if (!jobs.length) return;
      setIsMapLoading(true);

      const cacheKey = 'explore_geocode_cache_v1';
      const raw = localStorage.getItem(cacheKey);
      const cache = raw ? JSON.parse(raw) : {};
      const nextCoords = { ...jobCoordinates };

      const candidates = jobs
        .filter((job) => getLocationTag(job) !== 'REMOTE')
        .map((job) => ({ id: job.id, q: getLocationText(job), title: job.title }))
        .filter((j) => j.q)
        .slice(0, 25);

      for (const item of candidates) {
        if (nextCoords[item.id]) continue;
        if (cache[item.q]) {
          nextCoords[item.id] = cache[item.q];
          continue;
        }
        try {
          const params = new URLSearchParams({
            format: 'json',
            q: item.q,
            limit: '1'
          });
          const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
            headers: { Accept: 'application/json' }
          });
          const data = await res.json();
          if (Array.isArray(data) && data[0]) {
            const coord = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            nextCoords[item.id] = coord;
            cache[item.q] = coord;
          }
          await new Promise((r) => setTimeout(r, 180));
        } catch (err) {
          console.error('Geocode failed for', item.q, err);
        }
      }

      localStorage.setItem(cacheKey, JSON.stringify(cache));
      setJobCoordinates(nextCoords);
      setIsMapLoading(false);
    };

    geocodeJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, userPosition]);

  const nearbyJobs = useMemo(() => {
    if (!userPosition) return [];
    return trendingView
      .map((job) => {
        const coord = jobCoordinates[job.id];
        if (!coord) return null;
        return {
          ...job,
          coord,
          distanceKm: haversineKm(userPosition, coord)
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 12);
  }, [trendingView, jobCoordinates, userPosition]);

  const mappedJobs = useMemo(() => {
    return trendingView
      .map((job) => {
        const coord = jobCoordinates[job.id];
        if (!coord) return null;
        return { ...job, coord };
      })
      .filter(Boolean)
      .slice(0, 20);
  }, [trendingView, jobCoordinates]);

  const mapCenter = useMemo(() => {
    if (userPosition) return userPosition;
    if (mappedJobs.length > 0) return mappedJobs[0].coord;
    return DEFAULT_CENTER;
  }, [userPosition, mappedJobs]);

  useEffect(() => {
    if (!mapCenter || !mapElementRef.current || mapRef.current) return;

    const map = L.map(mapElementRef.current, {
      zoomControl: true
    }).setView([mapCenter.lat, mapCenter.lng], userPosition ? 11 : 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    mapRef.current = map;
    mapLayersRef.current = L.layerGroup().addTo(map);
    window.setTimeout(() => map.invalidateSize(), 50);
  }, [mapCenter, userPosition]);

  useEffect(() => {
    if (!mapRef.current || !mapCenter) return;
    mapRef.current.setView([mapCenter.lat, mapCenter.lng], userPosition ? 11 : 6);
    mapRef.current.invalidateSize();
  }, [mapCenter, userPosition]);

  useEffect(() => {
    if (!mapRef.current || !mapLayersRef.current || !mapCenter) return;

    const layerGroup = mapLayersRef.current;
    layerGroup.clearLayers();

    if (userPosition) {
      L.marker([userPosition.lat, userPosition.lng], { icon: personIcon })
        .bindPopup('You are here')
        .addTo(layerGroup);

      L.circle([userPosition.lat, userPosition.lng], {
        radius: 20000,
        color: '#d76925',
        weight: 1.5
      }).addTo(layerGroup);
    }

    const jobsToRender = userPosition ? nearbyJobs : mappedJobs;
    jobsToRender.forEach((job) => {
      const distanceLabel = typeof job.distanceKm === 'number'
        ? `${job.distanceKm.toFixed(1)} km away`
        : 'Mapped location';
      L.marker([job.coord.lat, job.coord.lng], { icon: jobIcon })
        .bindPopup(`<strong>${job.title}</strong><br/>${getCompany(job)}<br/>${distanceLabel}`)
        .addTo(layerGroup);
    });
  }, [nearbyJobs, mappedJobs, userPosition, mapCenter]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      mapLayersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const container = recoScrollRef.current;
    if (!container || trendingView.length < 2) return undefined;

    let timer = null;
    const start = () => {
      timer = window.setInterval(() => {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: clientWidth * 0.85, behavior: 'smooth' });
        }
      }, 3500);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    start();
    container.addEventListener('mouseenter', stop);
    container.addEventListener('mouseleave', start);
    container.addEventListener('touchstart', stop, { passive: true });
    container.addEventListener('touchend', start, { passive: true });

    return () => {
      stop();
      container.removeEventListener('mouseenter', stop);
      container.removeEventListener('mouseleave', start);
      container.removeEventListener('touchstart', stop);
      container.removeEventListener('touchend', start);
    };
  }, [trendingView.length]);

  useEffect(() => {
    const container = latestScrollRef.current;
    if (!container || latestView.length < 2) return undefined;

    let timer = null;
    const start = () => {
      timer = window.setInterval(() => {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: clientWidth * 0.85, behavior: 'smooth' });
        }
      }, 3600);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    start();
    container.addEventListener('mouseenter', stop);
    container.addEventListener('mouseleave', start);
    container.addEventListener('touchstart', stop, { passive: true });
    container.addEventListener('touchend', start, { passive: true });

    return () => {
      stop();
      container.removeEventListener('mouseenter', stop);
      container.removeEventListener('mouseleave', start);
      container.removeEventListener('touchstart', stop);
      container.removeEventListener('touchend', start);
    };
  }, [latestView.length]);

  if (isLoading) return <ExploreSkeleton />;

  return (
    <div className="explore-page">
      <section className="explore-hero">
        <h1>Explore Opportunities</h1>
        <p>Search by job title, company, industry, location type, or skill.</p>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.7, color: 'var(--text-secondary)' }} />
          <input
            className="explore-search"
            style={{ paddingLeft: '2.2rem' }}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jobs on Explore..."
          />
        </div>
      </section>

      <section className="explore-section">
        <div className="explore-section-head">
          <h2>{activeQuery ? 'Search Results' : 'New Jobs'}</h2>
          {activeQuery && <span>{isSearching ? 'Searching...' : `${latestView.length} found`}</span>}
        </div>
        <div className="reco-scroll" ref={latestScrollRef}>
          {latestView.map((job) => (
            <Link key={`latest-${job.id}`} to={`/jobs/${job.id}`}>
              <PopularJobCard job={job} />
            </Link>
          ))}
        </div>
        {activeQuery && !isSearching && latestView.length === 0 && (
          <p className="map-note">No jobs matched your search.</p>
        )}
      </section>

      <section className="explore-section">
        <div className="explore-section-head">
          <h2><MapPin size={16} /> Jobs Near You</h2>
          <span>
            <LocateFixed size={14} /> {(userPosition ? nearbyJobs : mappedJobs).length} mapped
          </span>
        </div>
        {geoError && <p className="map-note">{geoError}</p>}
        <div className="nearby-meta">
          <span>
            {userPosition
              ? 'Showing closest onsite/hybrid opportunities from your current location.'
              : 'Showing mapped opportunities. Enable location for true nearby ranking.'}
          </span>
          {isMapLoading && <span>Mapping job locations...</span>}
        </div>
        <div className="explore-map-wrap">
          <div ref={mapElementRef} className="explore-map" />
        </div>
      </section>

      <section className="explore-section">
        <div className="explore-section-head">
          <h2>{activeQuery ? 'Related Jobs' : 'Trending Jobs'}</h2>
        </div>
        <div className="reco-scroll" ref={recoScrollRef}>
          {trendingView.map((job) => (
            <Link key={`reco-${job.id}`} to={`/jobs/${job.id}`}>
              <PopularJobCard job={job} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
