export const generateCoverLetterAPI = async (apiKey, resumeText, jobDescription) => {
    if (!resumeText || !jobDescription || !apiKey) {
      throw new Error('Missing required information: API key, resume text, or job description.');
    }
  
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192', // Or your preferred model
          messages: [
            {
              role: 'system',
              content: `You are a professional cover letter writer specializing in concise, impactful cover letters.
  
  Instructions:
  1. Create a tailored cover letter based on the resume and job description.
  2. Keep the letter concise - aiming for 300-400 words total.
  3. Structure: 2-3 focused paragraphs highlighting relevant skills/experience matching the job description.
  4. Use professional language but avoid excessive corporate jargon. Be clear and direct.
  5. Important: Do **NOT** include any preamble like "Here is your cover letter:", "Okay, here's the draft:", etc. Start directly with the first paragraph of the letter body.
  6. Focus on specific achievements and quantifiable results where possible.
  7. Important: Skip all formalities like dates, addresses, salutations (e.g., "Dear Hiring Manager,"), and closings (e.g., "Sincerely,"). Only provide the core paragraphs of the letter body. Use standard paragraph breaks (\n\n).
  8. Ensure paragraphs are well-formed and not excessively long.
  9. Maintain a confident, professional, and enthusiastic tone.
  10. Proofread carefully for grammar and spelling errors.`
            },
            {
              role: 'user',
              content: `Resume Text:\n${resumeText}\n\nJob Description:\n${jobDescription}\n\nPlease write the core body paragraphs for a tailored cover letter based *only* on the provided resume and job description. Remember to omit salutations, closings, addresses, and any introductory phrases.`
            }
          ],
          temperature: 0.7, // Adjust temperature as needed
          max_tokens: 800, // Reduced slightly, as we only need the body
          top_p: 1,
          stream: false, // Ensure stream is false unless you handle streaming
        })
      });
  
      if (!response.ok) {
        // Try to parse error details from Groq's response
        let errorDetails = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error && errorData.error.message) {
            errorDetails = `API Error: ${errorData.error.message}`;
          }
        } catch (parseError) {
          // Ignore if error response is not JSON
           errorDetails += ` - ${await response.text()}`;
        }
        throw new Error(errorDetails);
      }
  
      const data = await response.json();
  
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        const content = data.choices[0].message.content;
        // Clean potential leading/trailing whitespace or unwanted intro phrases just in case
         const cleanedContent = content
           .replace(/^(Okay, |Sure, |Here is |I've created |Please find |Attached is |Below is ).*?:?\s*/i, '')
           .trim();
        return cleanedContent;
      } else {
        console.error("Unexpected API response format:", data);
        throw new Error('Unexpected response format from API. No valid content found.');
      }
    } catch (err) {
      console.error('Error calling Groq API:', err);
      // Rethrow or handle the error, ensuring it's an Error object
      throw new Error(`Failed to generate cover letter: ${err.message || 'Unknown API error'}`);
    }
  };