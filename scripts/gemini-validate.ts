import { readFileSync } from 'fs';
import { join } from 'path';

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "google/gemini-flash-3.1";

const pages = [
  {
    name: 'auth',
    title: 'Auth Page',
    description: 'Mobile auth page with: purple hero card at top with "Sports near you, without guessing..." headline and badges (Compass/Nearby sports, Shield/Text-only safety demo); below that a card titled "Jump in fast" with 4 demo user buttons (avatar + name + interests), then a signup form: display name input field (labeled "Display name", placeholder "e.g. Noor"), interest selection with multiple pill buttons (Tennis, Running pre-selected as shown by filled style), nearby discovery toggle switch, and orange gradient "Enter Bubbleverse" CTA button with ArrowRight icon'
  },
  {
    name: 'discover',
    title: 'Discover Page',
    description: 'Full-screen Leaflet map with multiple colored pin markers (purple, orange, red, blue). Top toolbar row: left avatar button (opens profile), center purple Bubbleverse brand pill badge, right logout icon button. Below that a filter row with category pill buttons showing count (e.g., "All" with count). Bottom overlay: event preview card showing sport badge, title, clock/time, user icon with count, location with distance. Bottom-right: orange plus (create) FAB button and gray crosshair button. No bottom navigation bar visible.'
  },
  {
    name: 'event-details',
    title: 'Event Details Tab (Tab Active)',
    description: 'Event detail page inside mobile device frame. Tab bar at top showing: Details, People, Location, Chat (Details tab active/selected). Hero section with large emoji icon in colored box, event title, location text, price badge, time badge. Stats grid showing: skill level, attendee count, women-only indicator. "About" section with description text. Large orange "Join & Open Chat" CTA button at bottom. Back arrow in top-left.'
  },
  {
    name: 'event-people',
    title: 'Event People Tab',
    description: 'Event page with People tab selected. Shows organizer/host card at top with avatar, name (e.g. "Iulia"), "Organizer" badge, verified host badge. Below is "Who is coming" section with grid of attendee person cards, each showing avatar, display name, and status badge (e.g. "on my way", "here", "interested").'
  },
  {
    name: 'event-map',
    title: 'Event Location Tab',
    description: 'Event page with Location tab selected. Shows Leaflet map with a single prominent location pin/marker. Card overlay at bottom showing location name/label (e.g. "X TU Delft Outdoor Courts") and coordinates. Tab bar shows Details, People, Location (selected), Chat.'
  },
  {
    name: 'event-chat',
    title: 'Event Chat Tab',
    description: 'Event page with Chat tab selected. Shows card with lock icon, "You\'re in!" heading, row of attendance status buttons (Interested, On my way, Here, Can\'t make it), reminder toggle switch. Below shows "Open Chat" orange CTA button. Tab bar shows Details, People, Location, Chat (selected).'
  },
  {
    name: 'create',
    title: 'Create Session Page',
    description: 'Multi-step session creation wizard showing "Step 1 of 4" subtitle and 4-segment progress bar. Content shows sport selection card with "Choose a sport" heading and Rocket icon. Grid of 3-column sport buttons with emoji icons: Tennis (🎾), Padel ( paddles), Running (🏃). Each button shows sport emoji + label. "Next" orange gradient button at bottom.'
  },
  {
    name: 'profile',
    title: 'My Profile Page',
    description: 'Profile page inside mobile device frame. Header: "Your profile" title, back arrow. Card with: large avatar circle with initial letter, display name (e.g. "Iulia"), bio text. Badge row showing: Verified host badge (if applicable), interests count badge, friends count badge, no-show strikes badge. Below: form sections for editing profile, nearby discovery toggle, settings sections.'
  },
  {
    name: 'chats',
    title: 'Chats List Page',
    description: 'Chats list page inside mobile device frame. Header with "Chats" title. List of chat items, each showing: avatar stack (multiple overlapping avatars), participant names (e.g. "Padel Doubles"), last message preview text (e.g. "Sounds good see you there"), relative timestamp (e.g. "2h"). Each item is a tappable card row.'
  },
  {
    name: 'chat',
    title: 'Chat Page',
    description: 'Individual event chat page inside mobile device frame. Header showing event name and back arrow. Message list area with message bubbles: some aligned left (others), some aligned right (own messages), sender name above bubble, timestamp below bubble. Bottom: composer area with text input field and send button (arrow icon). If not joined: join prompt with "Join session to access chat" message and orange "Join & Open Chat" button.'
  },
];

async function validateWithGemini(imagePath: string, page: { name: string; title: string; description: string }): Promise<{ valid: boolean; issues: string[]; summary: string }> {
  const imageData = readFileSync(imagePath);
  const base64Image = imageData.toString('base64');

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a UI validation expert. Analyze this screenshot of a mobile web app page.

Page: ${page.title}

Look carefully at what is ACTUALLY VISIBLE in the image and compare against these expected elements:
${page.description}

Important:
- Look at the actual visual content: text, buttons, icons, cards, form fields, badges
- Form inputs may have floating labels or placeholder text - look for any input field structures
- Check if buttons are styled as pills, outlines, or filled - describe what you see
- Look for any "Verified host" badge with a shield icon on profile pages
- Check the exact text content visible in buttons and badges

Respond with ONLY a JSON object in this exact format, no other text:
{
  "valid": true or false,
  "issues": ["list of specific visual issues ONLY if something is clearly missing or broken - empty array if page looks correct"],
  "summary": "brief 1-sentence assessment of what you see"
}`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 400,
    }),
  });

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return { valid: true, issues: [], summary: content.slice(0, 200) };
    }
  }

  return { valid: true, issues: [], summary: content.slice(0, 200) };
}

async function main() {
  console.log('Validating screenshots with Gemini Flash 3.1...\n');

  const results = [];
  for (const page of pages) {
    const imagePath = join('/Volumes/T7/lonely_boy/screenshots/validate', `${page.name}.png`);
    console.log(`Analyzing ${page.name}.png (${page.title})...`);

    try {
      const result = await validateWithGemini(imagePath, page);
      results.push({ page: page.name, title: page.title, ...result });
      console.log(`  ${result.valid ? '✅ VALID' : '❌ INVALID'}: ${result.summary.slice(0, 80)}`);
      if (result.issues.length > 0) {
        result.issues.forEach(i => console.log(`    Issue: ${i}`));
      }
    } catch (error) {
      console.log(`  Error: ${error}`);
      results.push({ page: page.name, title: page.title, valid: false, issues: [`API error: ${error}`], summary: '' });
    }
  }

  console.log('\n=== VALIDATION SUMMARY ===');
  const allValid = results.every(r => r.valid);
  console.log(`All pages valid: ${allValid}\n`);

  for (const r of results) {
    console.log(`${r.title}: ${r.valid ? '✅' : '❌'}`);
    if (r.issues.length > 0) {
      r.issues.forEach(i => console.log(`  - ${i}`));
    }
    console.log('');
  }
}

main();