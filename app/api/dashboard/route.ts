import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();

    try {
      // 1. Get all students and aggregate their latest stats
      const result = await client.query(`
        SELECT 
          sp.id,
          sp.name,
          sp.preferred_mode as mode,
          COALESCE(SUM(ls.words_read), 0) as "wordsRead",
          COALESCE(AVG(ls.comprehension), 0) as "comprehension",
          COALESCE(SUM(ls.time_spent_min), 0) as "sessionTime",
          MAX(ls.created_at) as "lastActiveRaw"
        FROM student_profiles sp
        LEFT JOIN learning_sessions ls ON sp.id = ls.student_id
        GROUP BY sp.id, sp.name, sp.preferred_mode
      `);

      const studentData = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        mode: row.mode === 'dyslexia' ? 'Dyslexia' : row.mode === 'adhd' ? 'ADHD' : 'Standard',
        wordsRead: parseInt(row.wordsRead, 10),
        comprehension: Math.round(parseFloat(row.comprehension)),
        sessionTime: parseInt(row.sessionTime, 10),
        lastActive: row.lastActiveRaw ? new Date(row.lastActiveRaw).toLocaleDateString() : 'Never',
        struggles: [] // We'll populate this next
      }));

      // 2. Fetch struggle points
      const strugglesResult = await client.query(`
        SELECT student_id, topic, struggle_type 
        FROM struggle_points
      `);
      
      const strugglesByStudent = strugglesResult.rows.reduce((acc, curr) => {
        if (!acc[curr.student_id]) acc[curr.student_id] = [];
        acc[curr.student_id].push(`${curr.topic}: ${curr.struggle_type}`);
        return acc;
      }, {} as Record<string, string[]>);

      studentData.forEach(student => {
        student.struggles = strugglesByStudent[student.id] || ['None detected'];
      });

      // 3. Class progress (simplified to days ago for the demo)
      const classProgressResult = await client.query(`
        SELECT 
          date_trunc('day', created_at) as date,
          AVG(words_read) as avg_words,
          AVG(time_spent_min) as avg_time
        FROM learning_sessions
        GROUP BY date_trunc('day', created_at)
        ORDER BY date ASC
        LIMIT 7
      `);

      const classProgress = classProgressResult.rows.map((row, index) => ({
        week: `Day ${index + 1}`,
        avgWords: Math.round(parseFloat(row.avg_words)),
        avgTime: Math.round(parseFloat(row.avg_time))
      }));

      // 4. Struggle points for the scatter plot
      const strugglePoints = strugglesResult.rows.map(row => {
        // Find matching student to get their X/Y stats
        const student = studentData.find(s => s.id === row.student_id);
        return {
          x: student ? student.wordsRead : 0,
          y: student ? student.comprehension : 0,
          name: `${row.topic} - ${row.struggle_type}`
        };
      });

      return NextResponse.json({
        studentData,
        classProgress,
        strugglePoints
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('API Error in /api/dashboard:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching dashboard data.' },
      { status: 500 }
    );
  }
}
