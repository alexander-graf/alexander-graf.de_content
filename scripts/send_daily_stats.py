#!/usr/bin/env python3
import os
import sys
import json
import re
import hashlib
from collections import Counter
import urllib.request
import urllib.parse
from datetime import datetime

# Load Configuration
CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'stats_config.json')

if not os.path.exists(CONFIG_PATH):
    print(f"Error: Config file not found at {CONFIG_PATH}")
    sys.exit(1)

with open(CONFIG_PATH, 'r') as f:
    config = json.load(f)

BOT_TOKEN = config.get('telegram_bot_token')
CHAT_ID = config.get('telegram_chat_id')
DOMAINS = config.get('domains', [])
LOG_PATH = config.get('log_file_path')

if BOT_TOKEN == 'YOUR_TELEGRAM_BOT_TOKEN_HERE':
    print("Warning: Please set your actual Telegram Bot Token in stats_config.json first.")
    sys.exit(0)

# Bot Detection Regex
BOT_REGEX = re.compile(
    r"(?i)bot|crawler|spider|ping|monitor|status|uptime|check|scan|scrape|curl|wget|python|libwww|perl|ruby|go-http|"
    r"semrush|ahrefs|mj12|dotbot|facebookexternalhit|twitterbot|linkedinbot|slackbot|telegrambot|embed|fetch|"
    r"validator|lighthouse|pagespeed|headless|wordpress|pantheon|amazon|google|bing|yahoo|baidu|yandex"
)

def is_page_view(path):
    # Ignore typical static files/assets
    if any(path.lower().endswith(ext) for ext in [
        '.png', '.jpg', '.jpeg', '.gif', '.css', '.js', '.ico', '.svg', 
        '.woff', '.woff2', '.txt', '.xml', '.map', '.json', '.webmanifest',
        '.zip', '.tar', '.gz', '.pdf', '.php'
    ]):
        return False
        
    # Ignore typical system/exploit/crawler paths
    if any(p in path.lower() for p in [
        'wp-admin', 'wp-content', 'wp-includes', 'xmlrpc', '.well-known',
        'actuator', 'env', 'config', 'setup', 'admin', 'api', 'webhook'
    ]):
        return False
        
    return True

def process_logs():
    if not os.path.exists(LOG_PATH):
        print(f"Log file not found at {LOG_PATH}")
        return None

    uniques = set()
    total_pageviews = 0
    pages_counter = Counter()

    with open(LOG_PATH, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
            except json.JSONDecodeError:
                continue

            # 1. Match Domain
            req_host = data.get('RequestHost', '')
            if req_host not in DOMAINS:
                continue

            # 2. Only GET requests
            if data.get('RequestMethod') != 'GET':
                continue

            # 3. Only successful page views
            if data.get('DownstreamStatus') != 200:
                continue

            # 4. Filter page path
            path = data.get('RequestPath', '/')
            if not is_page_view(path):
                continue

            # 5. Detect and filter bots based on User-Agent
            ua = data.get('request_User-Agent', '')
            if BOT_REGEX.search(ua):
                continue

            # 6. Extract IP (prioritize real client IP behind proxy)
            ip = data.get('request_X-Real-Ip', '') or data.get('request_X-Forwarded-For', '') or data.get('ClientHost', '')
            if not ip:
                continue

            # Hashed identifier for unique visitor (fully GDPR compliant, no IP stored)
            visitor_id = hashlib.sha256(f"{ip}|{ua}".encode('utf-8')).hexdigest()
            uniques.add(visitor_id)
            
            total_pageviews += 1
            pages_counter[path] += 1

    return len(uniques), total_pageviews, pages_counter

def send_telegram_message(text):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = urllib.parse.urlencode({
        'chat_id': CHAT_ID,
        'text': text,
        'parse_mode': 'HTML'
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/x-www-form-urlencoded'})
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data.get('ok', False)
    except urllib.error.HTTPError as he:
        err_body = he.read().decode('utf-8')
        print(f"Telegram API HTTP Error {he.code}: {err_body}")
        return False
    except Exception as e:
        print(f"Error sending Telegram message: {e}")
        return False

def main():
    print("Processing visitor statistics...")
    res = process_logs()
    if res is None:
        return

    uniques_count, total_pageviews, pages_counter = res
    date_str = datetime.now().strftime('%d.%m.%Y')

    # Format message
    msg = f"📊 <b>Statistik für alexandergraf.de</b>\n"
    msg += f"📅 Datum: {date_str}\n\n"
    msg += f"👥 Echte Besucher (Uniques): <b>{uniques_count}</b>\n"
    msg += f"📄 Seitenaufrufe (Pageviews): <b>{total_pageviews}</b>\n\n"
    
    if pages_counter:
        msg += "🔝 <b>Beliebteste Seiten:</b>\n"
        for i, (path, count) in enumerate(pages_counter.most_common(5), 1):
            msg += f"{i}. <code>{path}</code> ({count} Aufrufe)\n"
    else:
        msg += "Keine Seitenaufrufe aufgezeichnet."

    print(f"Stats summary:\n{msg}")

    # Send to Telegram
    success = send_telegram_message(msg)
    if success:
        print("Telegram message sent successfully.")
        # Empty/truncate the log file to prepare for the next day
        try:
            open(LOG_PATH, 'w').close()
            print("Access log successfully truncated.")
        except Exception as e:
            print(f"Error truncating log file: {e}")
    else:
        print("Failed to send stats via Telegram. Log file NOT truncated.")

if __name__ == '__main__':
    main()
