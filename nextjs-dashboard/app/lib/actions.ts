'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: '고객을 선택해 주세요.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: '$0보다 큰 단위로 입력해 주세요.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'invoice 상태를 선택해 주세요.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// 이 부분은 @types/react-dom이 업데이트될 때까지의 임시 조치입니다.
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // Zod를 사용하여 양식 유효성을 검사합니다.
  const validatedFields = CreateInvoice.safeParse({
    // 성공 또는 오류 필드를 포함한 객체를 반환, try/catch 문에 넣지 않아도 된다.
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // 양식 유효성 검사 실패 시 오류를 빠르게 반환합니다. 그렇지 않으면 계속 진행합니다.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '필수 필드가 누락되었습니다. 송장 생성에 실패했습니다.',
    };
  }

  // 데이터베이스 삽입을 위해 데이터를 준비합니다.
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // 데이터베이스에 데이터를 삽입합니다.
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // 데이터베이스 오류가 발생하면 더 구체적인 오류를 반환합니다.
    return {
      message: '데이터베이스 오류: 송장 생성에 실패했습니다.',
    };
  }

  // 송장 페이지의 캐시를 다시 유효화하고 사용자를 리디렉션합니다.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  // Zod를 사용하여 양식 유효성을 검사합니다.
  const validatedFields = UpdateInvoice.safeParse({
    // 성공 또는 오류 필드를 포함한 객체를 반환, try/catch 문에 넣지 않아도 된다.
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // 양식 유효성 검사 실패 시 오류를 빠르게 반환합니다. 그렇지 않으면 계속 진행합니다.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '필수 필드가 누락되었습니다. 송장 수정에 실패했습니다.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  throw new Error('Failed to Delete Invoice');

  // try {
  //   await sql`DELETE FROM invoices WHERE id = ${id}`;
  //   revalidatePath('/dashboard/invoices');
  //   return { message: 'Deleted Invoice.' };
  // } catch (error) {
  //   return { message: 'Database Error: Failed to Delete Invoice.' };
  // }
}
