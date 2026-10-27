import './Spinner.css';

export default function Spinner({ label = 'Loading…' }) {
    return (
        <div className="spinner-overlay" role="status" aria-label={label}>
            <div className="spinner-ring" />
            <span>{label}</span>
        </div>
    );
}
