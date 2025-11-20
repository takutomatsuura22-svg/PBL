export default function Home() {
  return (
    <div style={{ margin: 0, padding: '40px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '8px' }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>PBL Dashboard</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>テストページが表示されています</p>
        <a href="/dashboard" style={{ color: '#00BFFF', textDecoration: 'underline' }}>ダッシュボードへ</a>
      </div>
    </div>
  )
}
