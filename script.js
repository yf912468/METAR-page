async function fetchVHHHMETAR() {
    const tableBody = document.getElementById('metar-body');
    
    // 1. Calculate hours needed (Today's data since 00Z)
    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const hoursSinceMidnight = Math.ceil((now - startOfToday) / (1000 * 60 * 60)) || 1;

    // 2. Build the Aviation Weather URL
    const targetUrl = `https://aviationweather.gov/api/data/metar?ids=VHHH&format=json&hours=${hoursSinceMidnight}&_=${now.getTime()}`;
    
    // 3. Use CorsProxy.io (Prepend the proxy URL)
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Proxy failed');
        
        const data = await response.json();

        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="2">No METARs found for today.</td></tr>';
            return;
        }

        // 4. Sort and Display
        tableBody.innerHTML = '';
        data.sort((a, b) => new Date(b.reportTime) - new Date(a.reportTime));

        data.forEach(report => {
            const row = document.createElement('tr');
            const timePart = report.reportTime ? report.reportTime.split(' ')[1].substring(0, 5) : "??:??";
            const rawText = report.rawOb;

            row.innerHTML = `
                <td style="font-weight: bold; color: #313ab7;">${timePart}</td>
                <td style="font-family: 'Courier New', monospace; letter-spacing: 0.5px;">${rawText}</td>
            `;
            
            // Highlight VHHH-specific weather (Thunderstorms, Heavy Rain, Fog)
            if (/(TS|SHRA|FG|DZ|VCTS|TYPH|RA)/.test(rawText)) {
                row.style.backgroundColor = 'rgba(49, 58, 183, 0.12)';
                row.style.borderLeft = '4px solid #313ab7';
            }
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Fetch Error:', error);
        tableBody.innerHTML = '<tr><td colspan="2" style="color: red;">Network Error: Try refreshing the page.</td></tr>';
    }
}

// Initial fetch
fetchVHHHMETAR();

// Refresh data every 30 minutes (1800000 ms)
setInterval(fetchVHHHMETAR, 1800000);

function updateClocks() {
    const now = new Date();

    // Options for Hong Kong Time
    const hktOptions = {
        timeZone: 'Asia/Hong_Kong',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    // Options for UTC
    const utcOptions = {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    document.getElementById('hkt-clock').textContent = 
        new Intl.DateTimeFormat('en-GB', hktOptions).format(now);
        
    document.getElementById('utc-clock').textContent = 
        new Intl.DateTimeFormat('en-GB', utcOptions).format(now);
}

// Run the clock immediately, then every second
setInterval(updateClocks, 1000);
updateClocks();

