import { Request, Response } from 'express';
import fetch from 'cross-fetch';

/**
 * Proxy stats from the ministry API to bypass CORS restrictions
 */
export async function getMinistryStats(req: Request, res: Response, next: any) {
  console.log("getMinistryStats:");

  try {
    const response = await fetch('http://covid19.health.gov.mv/api/fetch_stats');
    const data = await response.json();

    res
      .status(200)
      .json(data)
      .end();
  } catch (error) {
    console.error("getMinistryStats:", "Failed to get response from stats endpoint.");

    res
      .status(503)
      .json({
        message: "Data fetch failed.",
      })
      .end();
  }
}
