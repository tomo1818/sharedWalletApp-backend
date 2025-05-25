import { Hono } from 'jsr:@hono/hono'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

// 関数名に合わせてルーティングパスを設定
const functionName = 'expenses-add'
const app = new Hono().basePath(`/${functionName}`)

// Zodスキーマ定義
const ExpenseSchema = z.object({
  amount: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category_id: z.string().min(1),
  memo: z.string().optional(),
})

// Supabaseクライアント
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
  { auth: { persistSession: false } }
)

app.post('/', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ message: '認証エラー：トークンがありません' }, 401)
  }

  const token = authHeader.split(' ')[1]
  const { data: { user }, error: userError } = await supabase.auth.getUser(token)
  if (userError || !user) {
    return c.json({ message: '認証エラー：無効なユーザー' }, 401)
  }

  const body = await c.req.json()
  const parsed = ExpenseSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ message: 'バリデーションエラー', errors: parsed.error.flatten() }, 400)
  }

  const { data, error: insertError } = await supabase
    .from('expenses')
    .insert([{ ...parsed.data, user_id: user.id }])
    .select()
    .single()

  if (insertError) {
    return c.json({ message: '登録に失敗しました', error: insertError }, 500)
  }

  return c.json(data, 201)
})

Deno.serve(app.fetch)