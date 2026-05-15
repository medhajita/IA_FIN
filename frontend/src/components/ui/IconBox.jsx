export default function IconBox({ icon: Icon, bgColor, iconColor, size = 'md' }) {
  const dims      = { sm: 34, md: 40, lg: 46 }[size];
  const iconSize  = { sm: 16, md: 18, lg: 22 }[size];
  const radius    = { sm: 9,  md: 10, lg: 12 }[size];
  const sw        = { sm: 2,  md: 1.75, lg: 1.75 }[size];
  return (
    <div style={{
      width: dims, height: dims, borderRadius: radius,
      background: bgColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={iconSize} color={iconColor} strokeWidth={sw} />
    </div>
  );
}
