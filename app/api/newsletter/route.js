import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to persistent data storage
const DATA_DIR = path.join(process.cwd(), 'data');
const CSV_FILE = path.join(DATA_DIR, 'newsletter_subscribers.csv');
const JSON_FILE = path.join(DATA_DIR, 'newsletter_subscribers.json');

// Ensure data directory and files exist
function ensureFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(CSV_FILE)) {
    const header = 'Date,Time,Email,Source,Status\n';
    fs.writeFileSync(CSV_FILE, header, 'utf8');
  }

  if (!fs.existsSync(JSON_FILE)) {
    fs.writeFileSync(JSON_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

// Read subscribers helper
function getSubscribersList() {
  ensureFiles();
  try {
    const raw = fs.readFileSync(JSON_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

// GET: Export as CSV for Excel or return JSON list
export async function GET(request) {
  try {
    ensureFiles();
    const { searchParams } = new URL(request.url);
    const exportFormat = searchParams.get('export');

    if (exportFormat === 'csv') {
      const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="living_result_subscribers_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const subscribers = getSubscribersList();
    return NextResponse.json({
      success: true,
      count: subscribers.length,
      data: subscribers,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// POST: Save new subscriber to Excel CSV & JSON
export async function POST(request) {
  try {
    ensureFiles();
    let body = {};
    try {
      body = await request.json();
    } catch (_) {
      try {
        const text = await request.text();
        body = JSON.parse(text);
      } catch (e) {
        return NextResponse.json(
          { success: false, message: 'Invalid request body.' },
          { status: 400 }
        );
      }
    }

    const email = (body.email || '').trim().toLowerCase();
    const source = body.source || 'footer_newsletter';

    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
    const isoStr = now.toISOString();

    const subscribers = getSubscribersList();
    const existingIndex = subscribers.findIndex((s) => s.email === email);

    if (existingIndex !== -1) {
      // Already subscribed
      return NextResponse.json({
        success: true,
        message: 'You are already on the VIP priority list!',
        alreadySubscribed: true,
      });
    }

    // New entry
    const newEntry = {
      email,
      date: dateStr,
      time: timeStr,
      iso: isoStr,
      source,
      status: 'Active',
    };

    // Save to JSON
    subscribers.unshift(newEntry);
    fs.writeFileSync(JSON_FILE, JSON.stringify(subscribers, null, 2), 'utf8');

    // Append to CSV (Excel compatible)
    // Escape quotes or commas if any
    const safeEmail = `"${email.replace(/"/g, '""')}"`;
    const safeSource = `"${source.replace(/"/g, '""')}"`;
    const csvLine = `${dateStr},${timeStr},${safeEmail},${safeSource},Active\n`;
    fs.appendFileSync(CSV_FILE, csvLine, 'utf8');

    // Optional: Attempt forwarding to Express backend if online
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    try {
      fetch(`${backendUrl}/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      }).catch(() => {});
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'VIP access confirmed! Welcome to Living Result.',
      entry: newEntry,
    });
  } catch (err) {
    console.error('Newsletter error:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
