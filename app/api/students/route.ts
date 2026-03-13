import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/students
// Body: StudentProfile JSON  →  upserts a row in student_profiles
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!body.id || !body.name) {
    return NextResponse.json(
      { error: 'Request body must include "id" and "name".' },
      { status: 400 }
    );
  }

  const weights = (body.weightedProfile ?? {}) as Record<string, number>;

  const values = [
    body.id,
    body.name              ?? 'Learner',
    body.ageGroup          ?? 'teen',
    body.gradeLevel        ?? 10,
    body.diagnosisType     ?? [],
    body.medicationStatus  ?? false,
    body.comfortLevel      ?? 7,
    weights.dyslexia       ?? 20,
    weights.adhd           ?? 20,
    weights.standard       ?? 60,
    body.preferredMode     ?? 'standard',
    body.readingSpeed      ?? 'normal',
    body.focusSpan         ?? 'medium',
    body.colorPreference   ?? 'dark',
    body.fontScale         ?? 1.0,
    body.wordSpacing       ?? 1.0,
  ];

  const sql = `
    INSERT INTO student_profiles (
      id, name, age_group, grade_level, diagnosis_type,
      medication_status, comfort_level,
      dyslexia_score, adhd_score, standard_score, preferred_mode,
      reading_speed, focus_span,
      color_preference, font_scale, word_spacing
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7,
      $8, $9, $10, $11,
      $12, $13,
      $14, $15, $16
    )
    ON CONFLICT (id) DO UPDATE SET
      name              = EXCLUDED.name,
      age_group         = EXCLUDED.age_group,
      grade_level       = EXCLUDED.grade_level,
      diagnosis_type    = EXCLUDED.diagnosis_type,
      medication_status = EXCLUDED.medication_status,
      comfort_level     = EXCLUDED.comfort_level,
      dyslexia_score    = EXCLUDED.dyslexia_score,
      adhd_score        = EXCLUDED.adhd_score,
      standard_score    = EXCLUDED.standard_score,
      preferred_mode    = EXCLUDED.preferred_mode,
      reading_speed     = EXCLUDED.reading_speed,
      focus_span        = EXCLUDED.focus_span,
      color_preference  = EXCLUDED.color_preference,
      font_scale        = EXCLUDED.font_scale,
      word_spacing      = EXCLUDED.word_spacing,
      updated_at        = NOW()
    RETURNING *;
  `;

  try {
    const result = await pool.query(sql, values);
    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown DB error';
    console.error('[API POST /students] DB error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/students?id=<uuid>
// Returns the student profile row for the given UUID
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Query param "id" is required.' }, { status: 400 });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM student_profiles WHERE id = $1 LIMIT 1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    const row = result.rows[0];

    // Map snake_case DB columns → camelCase StudentProfile
    const profile = {
      id:               row.id,
      name:             row.name,
      ageGroup:         row.age_group,
      gradeLevel:       row.grade_level,
      diagnosisType:    row.diagnosis_type,
      medicationStatus: row.medication_status,
      comfortLevel:     row.comfort_level,
      weightedProfile: {
        dyslexia: Number(row.dyslexia_score),
        adhd:     Number(row.adhd_score),
        standard: Number(row.standard_score),
      },
      preferredMode:    row.preferred_mode,
      readingSpeed:     row.reading_speed,
      focusSpan:        row.focus_span,
      colorPreference:  row.color_preference,
      fontScale:        Number(row.font_scale),
      wordSpacing:      Number(row.word_spacing),
      createdAt:        row.created_at,
      updatedAt:        row.updated_at,
      userId:           '',
    };

    return NextResponse.json({ data: profile }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown DB error';
    console.error('[API GET /students] DB error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
