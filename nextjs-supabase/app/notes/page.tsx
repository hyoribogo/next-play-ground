import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Notes() {
  const cookieStore = cookies()

  // 클라이언트를 생성
  const supabase = createClient(cookieStore)
  // 클라이언트에서 query
  const { data: notes } = await supabase.from('notes').select()
  return <pre>{JSON.stringify(notes, null, 2)}</pre>
}
