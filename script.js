async function fetchVHHHMETAR() {
    const tableBody = document.getElementById('metar-body');
    
    // 1. Calculate hours since 00:00 UTC
    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const hoursSinceMidnight = Math.ceil((now - startOfToday) / (1000 * 60 * 60)) || 1;

    // 2. Direct AWC API (Works on GitHub Pages because it's HTTPS)
    const url = `https://aviationweather.gov/api/data/metar?ids=VHHH&format=json&hours=${hoursSinceMidnight}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();

        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="2">No data available for today yet.</td></tr>';
            return;
        }

        // 3. Clear and Sort (Latest first)
        tableBody.innerHTML = '';
        data.sort((a, b) => new Date(b.reportTime) - new Date(a.reportTime));

        // 4. Populate Table
        data.forEach(report => {
            const row = document.createElement('tr');
            const timePart = report.reportTime ? report.reportTime.split(' ')[1].substring(0, 5) : "??:??";
            const rawText = report.rawOb;

            row.innerHTML = `
                <td>${timePart}</td>
                <td style="font-family: 'Courier New', monospace;">${rawText}</td>
            `;
            
            // Highlight significant weather for VHHH (TS, SHRA, FG, DZ)
            if (/(TS|SHRA|FG|DZ|VCTS)/.test(rawText)) {
                row.style.backgroundColor = 'rgba(49, 58, 183, 0.15)';
                row.style.fontWeight = 'bold';
            }

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('METAR Fetch Error:', error);
        tableBody.innerHTML = '<tr><td colspan="2">Error loading data. Check internet connection.</td></tr>';
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

