import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('id');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Get the last 7 days of learning sessions for this student
      const result = await client.query(`
        SELECT 
          date_trunc('day', created_at) as date,
          to_char(created_at, 'Dy') as day,
          SUM(words_read) as words,
          SUM(time_spent_min) as time,
          AVG(comprehension) as accuracy
        FROM learning_sessions
        WHERE student_id = $1
        GROUP BY date_trunc('day', created_at), to_char(created_at, 'Dy')
        ORDER BY date ASC
        LIMIT 7
      `, [studentId]);

      // If no data exists, return empty array
      if (result.rows.length === 0) {
        return NextResponse.json({ mockData: [] });
      }

      const mockData = result.rows.map(row => ({
        day: row.day,
        words: parseInt(row.words, 10) || 0,
        time: parseInt(row.time, 10) || 0,
        accuracy: Math.round(parseFloat(row.accuracy)) || 0
      }));

      return NextResponse.json({ mockData });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('API Error in /api/progress:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching progress data.' },
      { status: 500 }
    );
  }
}
