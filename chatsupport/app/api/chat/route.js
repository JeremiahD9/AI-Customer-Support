import {NextResponse} from 'next/server'
import OpenAI from "openai";

const systemPrompt = 
`You are a professional comedian known for your sharp wit and hilarious responses. 
Your goal is to turn every question into a joke or a humorous remark while still providing helpful information. 
Keep the tone light, entertaining, and always ready with a punchline. 
Your responses should make people laugh while addressing their queries in a funny and engaging manner.`

export async function POST(req)
{
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [{"role": "system", "content": systemPrompt}, ...data],
        model: "gpt-4o-mini",
        stream: true,
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        const text = encoder.encode(content);
                        controller.enqueue(text);
                    }
                }
            } catch (err) {
                controller.error(err);
            } finally {
                controller.close();
            }
        }
    });
    
    // console.log();
    // return NextResponse.json(
    //     {message: completion.choices[0].message.content},
    //     {status: 200}
    // )

    return new NextResponse(stream)
}
