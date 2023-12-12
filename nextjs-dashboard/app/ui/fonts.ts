import { Inter, Lusitana } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'] });
export const lusitana = Lusitana({
  weight: ['400', '700'],
  subsets: ['latin'],
});

// 빌드 시 폰트 파일을 다운로드하고 이를 다른 정적 자산과 함께 호스팅
// 폰트에 대한 추가 네트워크 요청을 하지 않음
