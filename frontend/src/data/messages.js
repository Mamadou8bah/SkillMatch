// One-on-one conversation data used by the messaging UI
// Strings use double quotes to avoid unescaped apostrophes.
export const messages = [
  {
    id: "conv_alice",
    contactId: "alice",
    contactName: "Alice Chen",
    contactAvatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFcyssMbcvEkMiCDu8zrO9VuN-Yy1aW1vycA&s",
    lastMessage: "Nice — I'll review after lunch.",
    unreadCount: 0,
    lastUpdated: "2025-10-30T15:50:00.000Z",
    messages: [
      { id: "conv_alice_m1", sender: "contact", text: "Hey! Are you free for a quick call tomorrow?", timestamp: "2025-10-30T14:50:00.000Z", read: true },
      { id: "conv_alice_m2", sender: "me", text: "Yes — 10am works for me.", timestamp: "2025-10-30T14:52:00.000Z", read: true },
      { id: "conv_alice_m3", sender: "contact", text: "Perfect. I'll send an invite.", timestamp: "2025-10-30T14:53:10.000Z", read: true },
      { id: "conv_alice_m4", sender: "me", text: "Thanks — talk then.", timestamp: "2025-10-30T14:55:00.000Z", read: true },
      { id: "conv_alice_m5", sender: "contact", text: "Great call — I'll send the notes.", timestamp: "2025-10-30T15:21:30.000Z", read: false },
      { id: "conv_alice_m6", sender: "me", text: "Appreciate it, Alice.", timestamp: "2025-10-30T15:22:00.000Z", read: false },
      { id: "conv_alice_m7", sender: "contact", text: "Also, check the spreadsheet I shared.", timestamp: "2025-10-30T15:25:00.000Z", read: false },
      { id: "conv_alice_m8", sender: "me", text: "Will do.", timestamp: "2025-10-30T15:26:00.000Z", read: false },
      { id: "conv_alice_m9", sender: "contact", text: "I added comments in the doc — take a look.", timestamp: "2025-10-30T15:30:00.000Z", read: false },
      { id: "conv_alice_m10", sender: "me", text: "Saw them — I'll address the top two.", timestamp: "2025-10-30T15:35:00.000Z", read: false },
      { id: "conv_alice_m11", sender: "contact", text: "Thanks — that'd be great.", timestamp: "2025-10-30T15:40:00.000Z", read: false },
      { id: "conv_alice_m12", sender: "me", text: "Pushed a small update to the branch.", timestamp: "2025-10-30T15:45:00.000Z", read: false },
      { id: "conv_alice_m13", sender: "contact", text: "Nice — I'll review after lunch.", timestamp: "2025-10-30T15:50:00.000Z", read: false }
    ]
  },
  {
    id: "conv_bob",
    contactId: "bob",
    contactName: "Bob Morales",
    contactAvatar: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAPEA8QDxAPDw8PDw8PDw8PDw8PDQ8PFRUWFhURFRUYHSkgGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQFy0dHyYrKy0tKy0tLS0tKy0vLSstLS0rLS0tLSstLS0tLS0tLS0tKy0rLS0rLS0tKy0tLS0tLf/AABEIALcBEwMBIgACEQEDEQH/xAAcAAADAAMBAQEAAAAAAAAAAAAAAQIDBQYEBwj/xAA+EAACAgECAwYEAwcDAQkAAAAAAQIRAwQhEjFBBQZRYXGBEyKRoQcywRRCUmJysdEj4fGyFSQzU5KTosLw/8QAGQEBAQEBAQEAAAAAAAAAAAAAAAECAwQF/8QAIREBAQACAwACAwEBAAAAAAAAAAECEQMhMRJBIjJREwT/2gAMAwEAAhEDEQA/AOvoCgo+S+ilIdDABAMAhBQxlEhQ6HQE0IuhUBAUVQgJJZUnW75I4nt38QcOLijpo/HyJ8KbfDgT8eLr7fUY43LyFsnrswPjWq7+doTpfFx403f+liSW/RuTdGfSfiNrcUn8RYdRG+Tj8OS947fY6/4Zuf8Ati+vBRzPdnvrptc/hq8Oav8AwsjXz/0P9705+R06OVll1XSWXuChUWFEVjaCjJQqIMVBRlaJaAx0KjI0KgrG0KjJRNAY2hNGVoTRFYqFRkoVARQjJQEGxoBgbZKgoYwiaHQDKJodDAoQUMAFQUUICGSzIznO/PbP7Ho8klfxMqeHE1+7OUX878kk39BJvpLdduN7/d7pZZT0umlWGLrNli2nllycU1+4nz8fTnwlNXyS67NP19dzc9g93c2sXFCLcI/Km38t1yOq0/4drgy8c7m4tYoxVY4za6t7tXXgeqZ4YdOF488+3zmealulypPr7+X+TDLMv4Y+Dpczo9N3Szzk45VwcLt9XfKm+W/6G51PcjHaak4xrdJb36ly58MUx/5s8pt8+jNpqSbTTUk06aa5NPoz6/8Ah93x/a0tNqH/AN6hG4y2SzwXX+tdV15+NfO+0+wnibSbl4bGpwzyYZxnByxzhJSjNbOLXUtmPLj0n5cWXb9JodHO9yO8X/aGm+JJKObHL4eaMeXFVqSXRNb/AF8DozxWWXVeqWWbhBQx0NCaCiqEQQ0JosTQVjaJaMjQmiDHQUU0IKloVFUOgJoRdAB7QoBlZIYAUFBQxlCFQwQCodDABCaGAEtHyv8AFfX/ABM+HTbxjih8SbfJym0l9FH7n1Zo+X/i7ov9TS5UopShkxyk+dxacV/8pHTi/Zjk/V0HcTSqOlhXVt3VWdTCkaHR6PIsGDFppxxQWOPHla4pVX7q8W3dmj7Zl+yU49rTx5Gqam/iKVPwbaT9CSbu3S+adhqcSe9bmj10HVHr7uavJlxXPNDUqr+JGKi/SkvU5LvH3lyvJ8DSPEsl8L46e/gYuHyvTcyuPrU9tpuT/wAnJ9qRfO3tszedo4NZV5dRppS58EJJtfRGqzYW8cuKotb+R34p8ftx5r855p2f4Lv5tculad1/7h9RSPnH4N6SsWrzc+PJjxKuXyR4n/1n0iJz5f3rPF+kCQ6GkMw6JaE0UDRBjoGUyWQTRLRYmFRRLRYqIJoKKodATQFUMD1AMRpDABgIYBRQAMAEA6CgFQDoKAmjlu+/Y71unzx4lF6fhy4lXOajJu34NOjq6PDmxOU8ipOMoKM07tqnVe739hLqzSyS728mi0vHgjB3w8EYum47cKXNGl7R7o6efDwY1CcZRkpt5JXJXTact2re78WdR2fJcEUn0K1D4Gq3bNTzcq771prezez46bF8OPJRa823vZ8a1cni188iim4ZpPhktnv1R9unqeFz48c3FQcnk+Xgj5JJ8V+1HxXvJrP2jV5JYYST4ko7NKSXU1x9VOTudvTqu7zyp5sSUeN8cnLLKck3z3o1mqxuMMkOb4fvdHZuEsWmuaqTir38jl1wy47W1O/qMc7fVy48Z51t1n4W9oZIS/YZRhwLFPUKUV8ym5q1J9dnXsj6SkfOvwqg3l1MpVccOGEer4XKbW/okfR6M5epZJ1BQ6BIqjKIoRbRNAS0Sy6E0QQyWU0JkEBRQgpUNIdDSAVAVQBGcYUMoQwoKABgBQAFAkAAMKAQBQ6AQmvX2dFCoDWYfknKPRN15IjtLWfDTk3CEY/myTvhj0XLmenWxUZJ9Jf3RhXzc9/USt+9uc1vbMHupZq/icOHHKvLzOI7c7SvIstSwzktlwXGuiex9I7SwTqsaSV+Ce/ucP3j0GSVSyTbklyfDt5JLkWXHfbrdXH8Wv1HauWWJ48yVpXGSupIz9yuxoazO8eXieJQlOfC3FuqSV+sk/Y0ubO5VD6n0j8MtLFYs81+Zzjjb8ElxV9X9jV6jjbt0PYfYGDRKfwVK8nDxSnLibq6XRdWbSgUS0jDOySHQ0goImhNF8ImgrG0S0ZGiWgMbRLMjRLRBADoEiBUUkCRSRdBUBVAUZQsYEAMQwEFlAUIBgArGAAAWAAKxgOMW9luEePX/up9b/Q5rtjtDLpJKXA8mBv5pJW8f9Xl5m6jro53cFJRg5RUpcNT/mjTfyvzKzQTVSV+vJon26Txzc+9uJ45VKCddWmvbyOM7w9sxkrUk5Vuk+Z03eHu7pWnk+HGD/lVW/Q4bN2VU6ilvy23N4/Hfa35SdPBpnNybaW/LlsfVvwwf+hni+ayxf1jX/1OBXYzgrfubbu/3lfZvxH8L4sZ8PFFS4JLhveLpp7N7fc1nlMvGMcLjj2+upFHl0GvxZoxcJK5RjPhe00pK1aPZRzZTYxgAiWyxAQyWWyWgqGSZGhAY6FRkoVEEopDopIoVAVQAMYwMhAMCgAAKAAGAgAyRxt89l9yyW+JbJ6xlRi3/noZ4Y1/yOS6HXHi/rjeb+Jjp99/9n7mSMXHhuNb1tyd7FQyuqasri2a6HbHGTxyyyt9c3DSfClKH8MuH26famZJPozbdoaVzqcK+JFU48lkj4X0fh9PNafIrtbqS/NGSqS9UebPC416+Pk+Ua7tLRwmvmNFj7Oxqbm96OjyQbXieDX4nGPJKzjXfG/Tmu0/mbSRrtB3elqsyhv8NfNll4Q6r1fJet9GdjoewJ5Um1wxfOcl08l1Om0PZ2PDHhgqXO3zk/Fnbh48r39OXPzYyanrWx7O4XGtns9tuFLkkbDBlyR5viXnz+p6eAfAem4SvFM7Bjzxfk/BmU888CZCc4cna8H0OOXF/HXHl/r1iZihqU+fyvz5GY5WWeussviWSyxMioEUJhUgMYCSKoEighAUACCgAy0EAAVAFAMBAMzaPHxSXgt2ak3dJbqbZcGk5N8+foZZ4j1yRg1P5b/hd+x7JjJOnjuVt7YuFrpY00/+DKnsRKJUTwoHEYrAmjFnwRn+dKVcm18y9HzRmsQNvDDs3HHkpe8m/wC5f7HC0+CLa5Nq6PUSyfGfxfnlftjeMiUDOTJFZeVxHRlkjGFLhCULK8CrGh482K0YsE5Rai3s+V9D16naEpeDX9zXSlxO+idL6mcsdxrHKytkDIhLbfn1HZ5LNPXOw0KigIJGkA0AJFJAgAYABUTQwCzDYFQwAQAFlQUbLs/HS83v7dDwY420l1dGzwyqU1/Copfc78M7248160yqV8XrRjzK4y81IjFk/Nz/ADP+wSncV5/qmel5zxL5V6IGi48vJbETZBDIZTZEghhZEpbr0JU9wMlCrdmSK2XrZiwu+J+dAOiWW/ckDHJGOSMsjFN0FRe/oSnvL/8AcxZVfL8yMEM1tdHsmgie3M3BpYtfmyOMfd9TDgjUYr+VD70zUcONPZKbb9En/knRu1H+iP1aC/T2Yt4+mz/QqiNG7eReEIv3uX+Czzc01dvRw3rRodk2Ozk7KSHRKKCGOhWNBKdCGBRAxDObYAAKAAAI9fZ2O5N+H92VjyVnmvGKf0/5M+hxtQXnv/g1uqycOqxX+9xR+qv9D24T44x5M7vKvZCVTmvSX2onDL7Sr26EZ5cOWD6STj7rciEvncfGpL1Ts2w9yyKMLfTl5t9A5LfmzyZZ/Pgh6zfstj1c9/Zf5AmRjnzSMtbnnVuTfhsETJ/O/QjE7ZM5fO/QrRK5Ae2ey9jzaHePq2/uZtW6T9DBoPy/UDPIxsyMxSCok9zFkZWV017nl1mSoOX8LT++4BGfzxXizVrV8cs0o88WoeJ15cL/ALSM7z3PbpUl6dTS93NTGWp7Rw9Y6lZV52kn/wBKJSRff3Uvi02Jc8uSOP2bXF9rN5pY0pP2XotjQ9uQWTUabLLZY8s35Koc/uje5Z8GJeLV11dhfqMvZD4pZpeaivb/AHbMtE9h46x+bbb9S8i3Zz5ZvF04rrIhoQzzPSZSIKQFjRKGGaoBAUQACo5uigEAQyoRtpeLog9XZ+O5X/CvuzeE3ZGcrqbbNeHhsc13jycGXBPwy4/u2v1OkRynfh1iclzjUvo0z25ePJj62var+RTXODUvbqefBk48qaeyi5N+VV+qM2OSyY1/PBfdHO6KU8epxQvbinB+cFCTr7L6EtJNuh0Xz5pSf7saXkbP9Dw9m46Um+rPWzUZpvZN+R5Iy5LxZk1c6j6sw6VcUr6IDzamVZZf0o9nZ0NrNdqneVm40+OohGLWy2Zj0L2DWvoTpdkB65GB82Zq2PHGd8XqBGpfI8uZ8UMkfGLMvaGVRSb6tI8OLL81eUrCtbppuM48XnFPxNH3dy8Pa+uTdLgk34coP9TZdoTcZ4q65P0ON7155afV6v4cnDJnx4eGcatKXApfaL36Ga6SOr74Z+FaTHjlFvJqFDJwtNxtqTi65OmjodXLjdcoxSj6+RznYmKGaUMvCvg6OHwtPD/zNRKuPI/Gtl68TOneLhSXXm34tiM3rpsuz41Dw2MebmZ9IqiYsyLZuaSXV2xjRI6PE9qholFAUiiEikghgABEWAAYdCbCwAqHZs9DjqF/xb+wAduCfk4816Z3LY5zvLj+JjnHxjJfYYHpy8efH15uxtVemwvqoRT9tjw9ozcdTp5x5/GSa8VLZ/ZsQGMr+LeM/J12GSrYy8wA6Obxdpz3jEz6ZKML8UMANVpVx5pPwN4gAFa7WS3RUNgAD0wexrFOsrXjuAAeft6F4tvFGu7Oy8UL61TAB9r9NfrMfFmwrwlxfRf7nH95tM9Xk1OfHy0uCHFyTnJZeW/8rl/6UAHLO6dsJt0v4fpvTYVLpKc35u/+TrskbYwNzxyz9bDDtExZQA0ywMYAePk/avXx/rAmUmAGWtqRViAB2AAXSbf/2Q==",
    lastMessage: "Will do — thanks.",
    unreadCount: 2,
    lastUpdated: "2025-10-29T09:40:00.000Z",
    messages: [
      { id: "conv_bob_m1", sender: "contact", text: "Morning — quick question about the API.", timestamp: "2025-10-29T08:05:00.000Z", read: true },
      { id: "conv_bob_m2", sender: "me", text: "Sure — what's up?", timestamp: "2025-10-29T08:06:00.000Z", read: true },
      { id: "conv_bob_m3", sender: "contact", text: "Our token rotation broke for one client.", timestamp: "2025-10-29T08:10:00.000Z", read: true },
      { id: "conv_bob_m4", sender: "me", text: "I'll look into it after standup.", timestamp: "2025-10-29T08:15:00.000Z", read: true },
      { id: "conv_bob_m5", sender: "contact", text: "Thanks — I've deployed the fix to staging.", timestamp: "2025-10-29T09:10:00.000Z", read: false },
      { id: "conv_bob_m6", sender: "me", text: "Nice. I'll run the smoke tests.", timestamp: "2025-10-29T09:11:00.000Z", read: false },
      { id: "conv_bob_m7", sender: "contact", text: "Let me know if you need anything else.", timestamp: "2025-10-29T09:12:00.000Z", read: false },
      { id: "conv_bob_m8", sender: "me", text: "Will do. Appreciate it.", timestamp: "2025-10-29T09:13:00.000Z", read: false },
      { id: "conv_bob_m9", sender: "contact", text: "Head's up — I added a test for the fix.", timestamp: "2025-10-29T09:20:00.000Z", read: false },
      { id: "conv_bob_m10", sender: "me", text: "Nice, that will help CI stability.", timestamp: "2025-10-29T09:25:00.000Z", read: false },
      { id: "conv_bob_m11", sender: "contact", text: "If CI still flakes, I'll rollback.", timestamp: "2025-10-29T09:30:00.000Z", read: false },
      { id: "conv_bob_m12", sender: "me", text: "Keep me posted — I can help debug.", timestamp: "2025-10-29T09:35:00.000Z", read: false },
      { id: "conv_bob_m13", sender: "contact", text: "Will do — thanks.", timestamp: "2025-10-29T09:40:00.000Z", read: false }
    ]
  },
  {
    id: "conv_carol",
    contactId: "carol",
    contactName: "Carol Nguyen",
    contactAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600",
    lastMessage: "Perfect, thanks.",
    unreadCount: 0,
    lastUpdated: "2025-10-27T18:45:00.000Z",
    messages: [
      { id: "conv_carol_m1", sender: "me", text: "Hi Carol — finished the mockups.", timestamp: "2025-10-27T16:40:00.000Z", read: true },
      { id: "conv_carol_m2", sender: "contact", text: "Nice! I'll review and share feedback.", timestamp: "2025-10-27T17:05:00.000Z", read: true },
      { id: "conv_carol_m3", sender: "me", text: "Thanks — happy to tweak anything.", timestamp: "2025-10-27T17:10:00.000Z", read: true },
      { id: "conv_carol_m4", sender: "contact", text: "Looks great. Could we increase the contrast on the CTA?", timestamp: "2025-10-27T17:30:00.000Z", read: true },
      { id: "conv_carol_m5", sender: "me", text: "Sure — I'll update the color palette.", timestamp: "2025-10-27T17:45:00.000Z", read: true },
      { id: "conv_carol_m6", sender: "contact", text: "Thanks — that design looks clean.", timestamp: "2025-10-27T18:00:00.000Z", read: true },
      { id: "conv_carol_m7", sender: "me", text: "You're welcome.", timestamp: "2025-10-27T18:02:00.000Z", read: true },
      { id: "conv_carol_m8", sender: "contact", text: "One small nit: the icon spacing on mobile.", timestamp: "2025-10-27T18:10:00.000Z", read: true },
      { id: "conv_carol_m9", sender: "me", text: "I'll tighten it up and push a fix.", timestamp: "2025-10-27T18:20:00.000Z", read: true },
      { id: "conv_carol_m10", sender: "contact", text: "Thanks — looks better now.", timestamp: "2025-10-27T18:35:00.000Z", read: true },
      { id: "conv_carol_m11", sender: "me", text: "Great — I'll bake that into the next release.", timestamp: "2025-10-27T18:40:00.000Z", read: true },
      { id: "conv_carol_m12", sender: "contact", text: "Perfect, thanks.", timestamp: "2025-10-27T18:45:00.000Z", read: true }
    ]
  },
  {
    id: "conv_david",
    contactId: "david",
    contactName: "David Park",
    contactAvatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRC8kiSH5ZSAcVoj3tAQQDoP_ux0sSricMyUg&s",
    lastMessage: "Thanks — I'll run the acceptance tests.",
    unreadCount: 1,
    lastUpdated: "2025-10-26T12:10:00.000Z",
    messages: [
      { id: "conv_david_m1", sender: "contact", text: "We need a unit test for the new util.", timestamp: "2025-10-26T10:00:00.000Z", read: true },
      { id: "conv_david_m2", sender: "me", text: "On it — I'll add a couple of cases.", timestamp: "2025-10-26T10:05:00.000Z", read: true },
      { id: "conv_david_m3", sender: "contact", text: "Thanks. Also consider edge inputs.", timestamp: "2025-10-26T10:10:00.000Z", read: true },
      { id: "conv_david_m4", sender: "me", text: "Good call — I'll include null and empty cases.", timestamp: "2025-10-26T10:15:00.000Z", read: true },
      { id: "conv_david_m5", sender: "contact", text: "Perfect. I'll take the first pass.", timestamp: "2025-10-26T11:44:00.000Z", read: false },
      { id: "conv_david_m6", sender: "me", text: "Thanks — ping me if anything fails.", timestamp: "2025-10-26T11:45:00.000Z", read: false },
      { id: "conv_david_m7", sender: "contact", text: "I left a patch in the PR with a small fix.", timestamp: "2025-10-26T11:50:00.000Z", read: false },
      { id: "conv_david_m8", sender: "me", text: "I'll review it and run tests locally.", timestamp: "2025-10-26T11:55:00.000Z", read: false },
      { id: "conv_david_m9", sender: "contact", text: "Cool — may reduce flakiness.", timestamp: "2025-10-26T12:00:00.000Z", read: false },
      { id: "conv_david_m10", sender: "me", text: "Merged and deployed to staging.", timestamp: "2025-10-26T12:05:00.000Z", read: false },
      { id: "conv_david_m11", sender: "contact", text: "Thanks — I'll run the acceptance tests.", timestamp: "2025-10-26T12:10:00.000Z", read: false }
    ]
  },
  {
    id: "conv_emma",
    contactId: "emma",
    contactName: "Emma Stone",
    contactAvatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTx8gJmwR4NiTBV9bMmSJHTsvxARf5wDqIXXQ&s",
    lastMessage: "Done — live now.",
    unreadCount: 0,
    lastUpdated: "2025-10-25T20:50:00.000Z",
    messages: [
      { id: "conv_emma_m1", sender: "contact", text: "The job post needs an updated salary range.", timestamp: "2025-10-25T18:00:00.000Z", read: true },
      { id: "conv_emma_m2", sender: "me", text: "What range do you suggest?", timestamp: "2025-10-25T18:02:00.000Z", read: true },
      { id: "conv_emma_m3", sender: "contact", text: "Let's list 80k-100k to be safe.", timestamp: "2025-10-25T18:10:00.000Z", read: true },
      { id: "conv_emma_m4", sender: "me", text: "Got it — I'll update the listing.", timestamp: "2025-10-25T18:20:00.000Z", read: true },
      { id: "conv_emma_m5", sender: "contact", text: "Thanks — appreciate it.", timestamp: "2025-10-25T19:30:00.000Z", read: true },
      { id: "conv_emma_m6", sender: "me", text: "Listing updated — added remote option.", timestamp: "2025-10-25T20:10:00.000Z", read: true },
      { id: "conv_emma_m7", sender: "contact", text: "Nice — that should broaden the pool.", timestamp: "2025-10-25T20:20:00.000Z", read: true },
      { id: "conv_emma_m8", sender: "me", text: "I'll also add a note about benefits.", timestamp: "2025-10-25T20:30:00.000Z", read: true },
      { id: "conv_emma_m9", sender: "contact", text: "Perfect — thanks.", timestamp: "2025-10-25T20:40:00.000Z", read: true },
      { id: "conv_emma_m10", sender: "me", text: "Done — live now.", timestamp: "2025-10-25T20:50:00.000Z", read: true }
    ]
  },
  {
    id: "conv_frank",
    contactId: "frank",
    contactName: "Frank Li",
    contactAvatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-23dNQNIIkiwIhbvD9lIvOMR7Zm26zTYkqw&s",
    lastMessage: "Verified — logs look great.",
    unreadCount: 0,
    lastUpdated: "2025-10-24T13:40:00.000Z",
    messages: [
      { id: "conv_frank_m1", sender: "me", text: "Pushed a small refactor to utils.", timestamp: "2025-10-24T12:40:00.000Z", read: true },
      { id: "conv_frank_m2", sender: "contact", text: "Saw it — running tests now.", timestamp: "2025-10-24T12:45:00.000Z", read: true },
      { id: "conv_frank_m3", sender: "me", text: "Let me know if anything breaks.", timestamp: "2025-10-24T12:50:00.000Z", read: true },
      { id: "conv_frank_m4", sender: "contact", text: "All green. Nice work on the refactor.", timestamp: "2025-10-24T13:14:00.000Z", read: true },
      { id: "conv_frank_m5", sender: "me", text: "Thanks — appreciate the quick check.", timestamp: "2025-10-24T13:15:00.000Z", read: true },
      { id: "conv_frank_m6", sender: "contact", text: "One more small improvement in logging.", timestamp: "2025-10-24T13:20:00.000Z", read: true },
      { id: "conv_frank_m7", sender: "me", text: "I'll add structured logs.", timestamp: "2025-10-24T13:25:00.000Z", read: true },
      { id: "conv_frank_m8", sender: "contact", text: "That will help debugging in prod.", timestamp: "2025-10-24T13:30:00.000Z", read: true },
      { id: "conv_frank_m9", sender: "me", text: "Done — deployed a patch.", timestamp: "2025-10-24T13:35:00.000Z", read: true },
      { id: "conv_frank_m10", sender: "contact", text: "Verified — logs look great.", timestamp: "2025-10-24T13:40:00.000Z", read: true }
    ]
  },
  {
    id: "conv_grace",
    contactId: "grace",
    contactName: "Grace Kim",
    contactAvatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnLQ8NRiF1He5-PnjToQzlnaNzvJ74-2vmQg&s",
    lastMessage: "Looking forward to it.",
    unreadCount: 0,
    lastUpdated: "2025-10-23T21:55:00.000Z",
    messages: [
      { id: "conv_grace_m1", sender: "contact", text: "Hey — there's a product meetup next week.", timestamp: "2025-10-23T20:00:00.000Z", read: true },
      { id: "conv_grace_m2", sender: "me", text: "Sounds fun. When is it?", timestamp: "2025-10-23T20:05:00.000Z", read: true },
      { id: "conv_grace_m3", sender: "contact", text: "Thursday evening in the city.", timestamp: "2025-10-23T20:10:00.000Z", read: true },
      { id: "conv_grace_m4", sender: "me", text: "I can probably make it.", timestamp: "2025-10-23T20:20:00.000Z", read: true },
      { id: "conv_grace_m5", sender: "contact", text: "Great — do you want to join the meetup next week?", timestamp: "2025-10-23T21:29:00.000Z", read: true },
      { id: "conv_grace_m6", sender: "me", text: "Yes — count me in.", timestamp: "2025-10-23T21:30:00.000Z", read: true },
      { id: "conv_grace_m7", sender: "contact", text: "I'll reserve two spots.", timestamp: "2025-10-23T21:40:00.000Z", read: true },
      { id: "conv_grace_m8", sender: "me", text: "Perfect — thanks for organizing.", timestamp: "2025-10-23T21:45:00.000Z", read: true },
      { id: "conv_grace_m9", sender: "contact", text: "See you there!", timestamp: "2025-10-23T21:50:00.000Z", read: true },
      { id: "conv_grace_m10", sender: "me", text: "Looking forward to it.", timestamp: "2025-10-23T21:55:00.000Z", read: true }
    ]
  },
  {
    id: "conv_irene",
    contactId: "irene",
    contactName: "Irene Adler",
    contactAvatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPQGdC4K9zAgmWFJ0Otp9n06QEosD3RS5k9Q&s",
    lastMessage: "Same here.",
    unreadCount: 0,
    lastUpdated: "2025-10-21T12:25:00.000Z",
    messages: [
      { id: "conv_irene_m1", sender: "contact", text: "Are you free for lunch next week?", timestamp: "2025-10-21T11:00:00.000Z", read: true },
      { id: "conv_irene_m2", sender: "me", text: "Next Wednesday works for me.", timestamp: "2025-10-21T11:05:00.000Z", read: true },
      { id: "conv_irene_m3", sender: "contact", text: "Great — lunch next Wednesday?", timestamp: "2025-10-21T11:30:00.000Z", read: true },
      { id: "conv_irene_m4", sender: "me", text: "Yes — let's meet around noon.", timestamp: "2025-10-21T11:45:00.000Z", read: true },
      { id: "conv_irene_m5", sender: "contact", text: "Perfect. I'll book a place.", timestamp: "2025-10-21T12:00:00.000Z", read: true },
      { id: "conv_irene_m6", sender: "me", text: "Thanks — send me the address.", timestamp: "2025-10-21T12:05:00.000Z", read: true },
      { id: "conv_irene_m7", sender: "contact", text: "Sent — it's the cafe on 3rd.", timestamp: "2025-10-21T12:10:00.000Z", read: true },
      { id: "conv_irene_m8", sender: "me", text: "Got it — see you then.", timestamp: "2025-10-21T12:15:00.000Z", read: true },
      { id: "conv_irene_m9", sender: "contact", text: "Great — looking forward to it.", timestamp: "2025-10-21T12:20:00.000Z", read: true },
      { id: "conv_irene_m10", sender: "me", text: "Same here.", timestamp: "2025-10-21T12:25:00.000Z", read: true }
    ]
  },
  {
    id: "conv_john",
    contactId: "john",
    contactName: "John Doe",
    contactAvatar: "data:image/jpeg;base64,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",
    lastMessage: "See you tomorrow.",
    unreadCount: 0,
    lastUpdated: "2025-10-20T16:50:00.000Z",
    messages: [
      { id: "conv_john_m1", sender: "contact", text: "Can you present at the demo tomorrow?", timestamp: "2025-10-20T15:00:00.000Z", read: true },
      { id: "conv_john_m2", sender: "me", text: "I can present the UI portion.", timestamp: "2025-10-20T15:10:00.000Z", read: true },
      { id: "conv_john_m3", sender: "contact", text: "Perfect — we'll slot you in at 10:30.", timestamp: "2025-10-20T15:50:00.000Z", read: true },
      { id: "conv_john_m4", sender: "me", text: "Thanks — see you then.", timestamp: "2025-10-20T16:00:00.000Z", read: true },
      { id: "conv_john_m5", sender: "contact", text: "Thanks — see you at the demo.", timestamp: "2025-10-20T16:20:00.000Z", read: true },
      { id: "conv_john_m6", sender: "me", text: "I'll bring the slides.", timestamp: "2025-10-20T16:30:00.000Z", read: true },
      { id: "conv_john_m7", sender: "contact", text: "Great — forward any notes ahead of time.", timestamp: "2025-10-20T16:35:00.000Z", read: true },
      { id: "conv_john_m8", sender: "me", text: "Will do.", timestamp: "2025-10-20T16:40:00.000Z", read: true },
      { id: "conv_john_m9", sender: "contact", text: "Thanks again.", timestamp: "2025-10-20T16:45:00.000Z", read: true },
      { id: "conv_john_m10", sender: "me", text: "See you tomorrow.", timestamp: "2025-10-20T16:50:00.000Z", read: true }
    ]
  }
];

function timeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const seconds = Math.floor((now - past) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  if (seconds < 60) return "just now";
  if (seconds < intervals.minute * 2) return "1m ago";

  if (seconds < intervals.hour)
    return `${Math.floor(seconds / intervals.minute)}m ago`;
  if (seconds < intervals.day)
    return `${Math.floor(seconds / intervals.hour)}h ago`;
  if (seconds < intervals.month)
    return `${Math.floor(seconds / intervals.day)}d ago`;
  if (seconds < intervals.year)
    return `${Math.floor(seconds / intervals.month)}mo ago`;

  return `${Math.floor(seconds / intervals.year)}y ago`;
}

export default messages;
export { timeAgo };
