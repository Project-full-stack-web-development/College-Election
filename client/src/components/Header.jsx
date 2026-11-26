export default function Header({ user, onLogout }) {
  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #ccc',
        paddingBottom: '12px',
        marginBottom: '24px',
      }}
    >
      <h1 style={{ margin: 0 }}>Campus Poll</h1>

      {user && (
        <div>
          <strong>{user.name}</strong> ({user.role}){' '}
          <button onClick={onLogout}>Log Out</button>
        </div>
      )}
    </header>
  );
}
