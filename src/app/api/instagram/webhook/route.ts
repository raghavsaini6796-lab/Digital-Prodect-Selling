import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const MetaAppSecret = process.env.META_APP_SECRET as string;
const VerifyToken = process.env.META_VERIFY_TOKEN as string;

// GET method handles Instagram Webhook verification (Hub Challenge)
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === VerifyToken) {
        return new NextResponse(challenge, { status: 200 });
    }
    
    return NextResponse.json({ error: 'Invalid verify token' }, { status: 403 });
}

// POST method handles incoming Instagram messages/events
export async function POST(request: NextRequest) {
    try {
        const signatureHeader = request.headers.get('x-hub-signature-256');
        if (!signatureHeader) throw new Error('Missing Instagram signature');

        // Extract the signature from the 'sha256=...' format
        const signature = signatureHeader.replace('sha256=', '');

        // It is safer to use req.text() to compute the hash exactly as received
        const rawBody = await request.text();
        const calculatedSignature = crypto
            .createHmac('sha256', MetaAppSecret)
            .update(rawBody)
            .digest('hex');

        if (!crypto.timingSafeEqual(Buffer.from(calculatedSignature, 'hex'), Buffer.from(signature, 'hex'))) {
            throw new Error('Invalid Instagram signature');
        }

        // Parse body after verification
        const body = JSON.parse(rawBody);

        // Process the webhook event
        switch (body.object) {
            case 'instagram':
            case 'page':
                if (body.entry) {
                    body.entry.forEach((entry: any) => {
                        if (entry.messaging) {
                            entry.messaging.forEach((message: any) => {
                                handleInstagramMessage(message);
                            });
                        }
                    });
                }
                break;
            default:
                console.warn(`Unhandled Instagram object: ${body.object}`);
        }

        return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
    } catch (error) {
        console.error('Instagram webhook error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

function handleInstagramMessage(message: any) {
    // Logic to handle Instagram messages (Queue logic will go here)
    console.log('[Instagram Webhook] Received message:', JSON.stringify(message));
}
