import { corsHeaders } from '@supabase/supabase-js/cors'

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { focus } = await req.json();
    const searchFocus = focus || 'corporate housing opportunities';
    const today = new Date().toISOString().split('T')[0];

    const systemPrompt = [
      'You are a B2B sales intelligence analyst specializing in corporate housing and extended-stay accommodations.',
      'Generate 8 realistic prospecting opportunities based on the user focus area.',
      'Each opportunity represents a company that likely needs corporate housing right now.',
      '',
      'For each opportunity provide:',
      '- company_name: A real or realistic company name',
      '- city: US city where the need exists',
      '- industry: Industry category',
      '- signal_type: Short signal label (e.g. "New Project", "Hiring Surge", "Office Expansion", "Contract Win", "Facility Launch")',
      '- signal_detail: 1-2 sentence explanation of why they need housing now',
      '- use_case: Why they would need corporate housing and what type of stay',
      '- recommended_titles: Array of 2-3 job titles to target (e.g. ["Project Manager", "HR Director", "Operations Lead"])',
      '- contact_name: A realistic contact name (first and last)',
      '- contact_title: Their job title',
      '- score: Priority score 60-100 (higher = more urgent need)',
      '',
      `Today's date is ${today}. All signals should be current and actionable.`,
      'Return ONLY a JSON array of objects. No markdown, no explanation.',
    ].join('\n');

    const response = await fetch('https://agentic.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Find corporate housing opportunities for: ${searchFocus}` },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API error: ${response.status} ${errText}`);
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || '[]';
    
    // Clean markdown code blocks
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    const opportunities = JSON.parse(content);

    return new Response(JSON.stringify({ opportunities }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
