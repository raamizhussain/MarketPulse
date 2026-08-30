export interface ExchangeMarketStatus {
  isOpen: boolean;
  isWeekend: boolean;
  exchange: 'NSE' | 'NASDAQ';
  statusBadge: string;
  statusLabel: string;
  scheduleDescription: string;
  isAMO: boolean;
  localTimeStr: string;
}

/**
 * Calculates authentic live exchange trading status based on real-world market hours:
 * - NSE/BSE (India): Mon-Fri 09:15 AM - 03:30 PM IST (UTC+5:30)
 * - NASDAQ/NYSE (US): Mon-Fri 09:30 AM - 04:00 PM EST (14:30 - 21:00 UTC / 13:30 - 20:00 UTC daylight)
 */
export function getExchangeMarketStatus(isIndian: boolean): ExchangeMarketStatus {
  const now = new Date();
  const utcDay = now.getUTCDay(); // 0 = Sun, 6 = Sat
  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();
  const utcTotalMin = utcHour * 60 + utcMinute;

  if (isIndian) {
    // IST = UTC + 5:30 (330 minutes)
    const istTotalMin = (utcTotalMin + 330) % 1440;
    const istDay = (utcTotalMin + 330 >= 1440) ? (utcDay + 1) % 7 : utcDay;
    const isWeekend = istDay === 0 || istDay === 6;

    // NSE Regular Hours: 09:15 (555 min) - 15:30 (930 min)
    const isOpen = !isWeekend && istTotalMin >= 555 && istTotalMin <= 930;
    
    // Format IST time
    const istHours = Math.floor(istTotalMin / 60);
    const istMins = istTotalMin % 60;
    const ampm = istHours >= 12 ? 'PM' : 'AM';
    const dispHour = istHours % 12 || 12;
    const localTimeStr = `${dispHour.toString().padStart(2, '0')}:${istMins.toString().padStart(2, '0')} ${ampm} IST`;

    let scheduleDescription = '';
    if (isWeekend) {
      scheduleDescription = 'Market Closed for Weekend • Reopens Monday 09:15 AM IST';
    } else if (istTotalMin < 555) {
      scheduleDescription = 'Pre-Market • Opens Today at 09:15 AM IST';
    } else if (istTotalMin > 930) {
      scheduleDescription = 'Market Closed • Reopens Tomorrow 09:15 AM IST';
    } else {
      scheduleDescription = 'Market Live • Regular Trading Active until 03:30 PM IST';
    }

    return {
      isOpen,
      isWeekend,
      exchange: 'NSE',
      statusBadge: isOpen ? 'NSE LIVE' : (isWeekend ? 'NSE WEEKEND CLOSED' : 'NSE CLOSED'),
      statusLabel: isOpen ? 'Market Open' : 'Market Closed (AMO Mode)',
      scheduleDescription,
      isAMO: !isOpen,
      localTimeStr
    };
  } else {
    // US Market (EST/EDT) approx UTC 13:30 (810 min) to 20:00 (1200 min)
    const isWeekend = utcDay === 0 || utcDay === 6;
    const isOpen = !isWeekend && utcTotalMin >= 810 && utcTotalMin <= 1200;

    const estTotalMin = (utcTotalMin - 240 + 1440) % 1440;
    const estHours = Math.floor(estTotalMin / 60);
    const estMins = estTotalMin % 60;
    const ampm = estHours >= 12 ? 'PM' : 'AM';
    const dispHour = estHours % 12 || 12;
    const localTimeStr = `${dispHour.toString().padStart(2, '0')}:${estMins.toString().padStart(2, '0')} ${ampm} EST`;

    let scheduleDescription = '';
    if (isWeekend) {
      scheduleDescription = 'Market Closed for Weekend • Reopens Monday 09:30 AM EST';
    } else if (utcTotalMin < 810) {
      scheduleDescription = 'Pre-Market • Opens Today at 09:30 AM EST';
    } else if (utcTotalMin > 1200) {
      scheduleDescription = 'After-Hours • Reopens Tomorrow 09:30 AM EST';
    } else {
      scheduleDescription = 'Market Live • Regular Trading Active until 04:00 PM EST';
    }

    return {
      isOpen,
      isWeekend,
      exchange: 'NASDAQ',
      statusBadge: isOpen ? 'NASDAQ LIVE' : (isWeekend ? 'NASDAQ WEEKEND CLOSED' : 'NASDAQ CLOSED'),
      statusLabel: isOpen ? 'Market Open' : 'Market Closed (AMO Mode)',
      scheduleDescription,
      isAMO: !isOpen,
      localTimeStr
    };
  }
}
