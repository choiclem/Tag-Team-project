# Devlog Duo

Clem과 Ryan이 모바일과 PC에서 함께 사용하는 실시간 개발일지입니다.

## Supabase 연결

1. Supabase에서 새 프로젝트를 만듭니다.
2. Supabase **SQL Editor**에서 `supabase-schema.sql` 전체를 실행합니다.
3. Supabase **Project Settings → API**에서 Project URL과 Publishable Key를 확인합니다.
4. `supabase-config.js`에 값을 입력합니다.

```js
window.DEVLOG_SUPABASE = {
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_PUBLISHABLE_KEY"
};
```

5. 변경된 `supabase-config.js`를 GitHub에 푸시합니다.

연결 후 프로젝트, 공지사항, 채팅, 개인 노트와 사진이 실시간으로 공유됩니다. 현재 사용자 선택과 보고 있는 화면 위치만 각 기기에 따로 저장됩니다.

처음 연결할 때 Supabase 데이터가 비어 있다면, 기존 기록이 있는 기기에서 페이지를 먼저 열어야 해당 기록이 최초 공유 데이터로 업로드됩니다.

## GitHub Pages

저장소의 **Settings → Pages**에서 `main` 브랜치를 배포하도록 설정합니다.

> 현재 스키마는 별도 로그인 없이 공유하도록 구성되어 있습니다. 공개 배포 주소를 아는 사람은 데이터를 변경할 수 있으므로, 외부 공개가 필요하면 Supabase Auth를 추가하세요.
