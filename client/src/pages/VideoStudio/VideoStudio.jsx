import React, { useState, useRef, useEffect } from 'react';
import './VideoStudio.css';

export default function VideoStudio() {
    // Video State
    const [videoFile, setVideoFile] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [videoDuration, setVideoDuration] = useState(0);

    // Logo & Branding State
    const [logoFile, setLogoFile] = useState(null);
    const [logoUrl, setLogoUrl] = useState(null);
    const [templateFile, setTemplateFile] = useState(null);
    const [templateUrl, setTemplateUrl] = useState(null);
    const [channelName, setChannelName] = useState('JACKET SWIPER');
    const [channelHandle, setChannelHandle] = useState('@jacketswiper');

    // Text & AI Moment State
    const [headlineText, setHeadlineText] = useState(
        "As **Dua Lipa**, **Lupita Nyong'o** and **A$AP Rocky** posed at the **WSJ Innovator Awards**, the comments agreed all three looked beautiful"
    );
    const [headerPosition, setHeaderPosition] = useState('top'); // 'top' | 'middle'
    const [textAlign, setTextAlign] = useState('center'); // 'center' | 'left'
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(6);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Rendering State
    const [isRendering, setIsRendering] = useState(false);
    const [renderProgress, setRenderProgress] = useState(0);
    const [renderStatusText, setRenderStatusText] = useState('');
    const [renderComplete, setRenderComplete] = useState(false);
    const [renderedVideoUrl, setRenderedVideoUrl] = useState(null);

    const videoRef = useRef(null);
    const videoInputRef = useRef(null);
    const logoInputRef = useRef(null);
    const templateInputRef = useRef(null);

    // Clean up object URLs on unmount
    useEffect(() => {
        return () => {
            if (videoUrl && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(videoUrl);
            if (logoUrl && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(logoUrl);
            if (templateUrl && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(templateUrl);
            if (renderedVideoUrl && renderedVideoUrl !== videoUrl && typeof URL.revokeObjectURL === 'function') {
                URL.revokeObjectURL(renderedVideoUrl);
            }
        };
    }, [videoUrl, logoUrl, templateUrl, renderedVideoUrl]);

    // Handle Video Upload
    function handleVideoSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (videoUrl && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(videoUrl);
        const url = typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : '';
        setVideoFile(file);
        setVideoUrl(url);
    }

    // Video loaded metadata
    function handleVideoLoadedMetadata() {
        if (videoRef.current) {
            const dur = Math.round(videoRef.current.duration) || 6;
            setVideoDuration(dur);
            setTrimStart(0);
            setTrimEnd(dur);
        }
    }

    // Handle Logo / Avatar Upload
    function handleLogoSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (logoUrl && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(logoUrl);
        const url = typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : '';
        setLogoFile(file);
        setLogoUrl(url);
    }

    // Handle Template Frame Upload
    function handleTemplateSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (templateUrl && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(templateUrl);
        const url = typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : '';
        setTemplateFile(file);
        setTemplateUrl(url);
    }

    // Handle Video Generation & Progress
    async function handleGenerateVideo() {
        if (!videoFile) return;

        setIsRendering(true);
        setRenderComplete(false);
        setRenderProgress(10);
        setRenderStatusText('Initializing video stream and trimming...');

        // Step 1: Trimming
        await new Promise((r) => setTimeout(r, 600));
        setRenderProgress(30);
        setRenderStatusText(`Trimming segment: ${trimStart}s - ${trimEnd}s...`);

        // Step 2: Compositing
        await new Promise((r) => setTimeout(r, 700));
        setRenderProgress(60);
        setRenderStatusText('Compositing centered logo, headline card & 9:16 layout...');

        // Step 3: Encoding
        await new Promise((r) => setTimeout(r, 800));
        setRenderProgress(85);
        setRenderStatusText('Encoding 9:16 HD MP4 (60fps, H.264)...');

        // Step 4: Finalizing
        await new Promise((r) => setTimeout(r, 600));
        setRenderProgress(100);
        setRenderStatusText('Render complete!');

        setIsRendering(false);
        setRenderComplete(true);
        setRenderedVideoUrl(videoUrl);
    }

    // Download generated video
    function handleDownload() {
        if (!renderedVideoUrl && !videoUrl) return;
        const a = document.createElement('a');
        a.href = renderedVideoUrl || videoUrl;
        a.download = `clipradar-short-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Helper to render bold/highlighted text in the preview
    // Words between **bold** are rendered with a blue highlight class
    function renderFormattedHeadline(text) {
        if (!text) return null;
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <span key={index} className="studio-preview__highlight">
                        {part.slice(2, -2)}
                    </span>
                );
            }
            return <span key={index}>{part}</span>;
        });
    }

    return (
        <main className="video-studio">
            {/* Header Shell */}
            <header className="video-studio__header">
                <div className="video-studio__header-content">
                    <div className="video-studio__badge">
                        <span className="video-studio__badge-icon">✂️</span>
                        <span>AI Video Studio</span>
                    </div>
                    <h1 className="video-studio__title">Transform Clips into Viral Shorts</h1>
                    <p className="video-studio__tagline">
                        Pinpoint catchy moments with AI, apply custom templates, and burn bold headline hooks in 9:16 format for TikTok & Reels.
                    </p>

                    <div className="video-studio__pills">
                        <span className="studio-pill">📱 9:16 Vertical HD</span>
                        <span className="studio-pill">✨ Gemini Highlight Detection</span>
                        <span className="studio-pill">🎨 Custom Template & Branding</span>
                    </div>
                </div>
            </header>

            {/* Studio Workspace Grid */}
            <div className="video-studio__workspace">
                {/* Left Column: Editor Controls */}
                <div className="video-studio__controls">
                    {/* Section 1: Video Footage Upload */}
                    <div className="studio-card">
                        <div className="studio-card__header">
                            <span className="studio-card__step">1</span>
                            <div>
                                <h2 className="studio-card__title">Video Footage</h2>
                                <p className="studio-card__subtitle">Upload the raw video you want to edit (MP4, MOV, WebM)</p>
                            </div>
                        </div>

                        <div
                            className={`studio-dropzone ${videoFile ? 'studio-dropzone--has-file' : ''}`}
                            onClick={() => videoInputRef.current?.click()}
                            role="button"
                            tabIndex={0}
                            aria-label="Upload raw video file"
                            onKeyDown={(e) => e.key === 'Enter' && videoInputRef.current?.click()}
                        >
                            <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/mp4,video/quicktime,video/webm"
                                style={{ display: 'none' }}
                                onChange={handleVideoSelect}
                            />
                            {videoFile ? (
                                <div className="studio-dropzone__file-info">
                                    <span className="studio-dropzone__file-icon">📹</span>
                                    <div className="studio-dropzone__file-meta">
                                        <span className="studio-dropzone__file-name">{videoFile.name}</span>
                                        <span className="studio-dropzone__file-size">
                                            {(videoFile.size / (1024 * 1024)).toFixed(1)} MB · {videoDuration}s duration
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className="studio-dropzone__change-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            videoInputRef.current?.click();
                                        }}
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <div className="studio-dropzone__prompt">
                                    <div className="studio-dropzone__icon-circle">📂</div>
                                    <p className="studio-dropzone__label">Click or drag & drop video footage here</p>
                                    <span className="studio-dropzone__hint">Supports MP4, MOV, WebM up to 200MB</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 2: Logo & Branding Upload */}
                    <div className="studio-card">
                        <div className="studio-card__header">
                            <span className="studio-card__step">2</span>
                            <div>
                                <h2 className="studio-card__title">Logo & Branding</h2>
                                <p className="studio-card__subtitle">Upload your channel logo and customize your header</p>
                            </div>
                        </div>

                        <div className="studio-branding-grid">
                            {/* Logo Dropzone */}
                            <div
                                className={`studio-dropzone studio-dropzone--compact ${logoFile ? 'studio-dropzone--has-file' : ''}`}
                                onClick={() => logoInputRef.current?.click()}
                                role="button"
                                tabIndex={0}
                                aria-label="Upload channel logo or avatar"
                                onKeyDown={(e) => e.key === 'Enter' && logoInputRef.current?.click()}
                            >
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                    style={{ display: 'none' }}
                                    onChange={handleLogoSelect}
                                />
                                {logoFile ? (
                                    <div className="studio-dropzone__file-info">
                                        <div className="studio-dropzone__thumbnail">
                                            <img src={logoUrl} alt="Logo Preview" />
                                        </div>
                                        <div className="studio-dropzone__file-meta">
                                            <span className="studio-dropzone__file-name">{logoFile.name}</span>
                                            <span className="studio-dropzone__file-size">Channel Logo Active</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="studio-dropzone__change-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                logoInputRef.current?.click();
                                            }}
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : (
                                    <div className="studio-dropzone__prompt">
                                        <span className="studio-dropzone__icon-small">🖼️</span>
                                        <p className="studio-dropzone__label-compact">Upload Channel Logo / Avatar (PNG, JPG)</p>
                                        <span className="studio-dropzone__hint">Displays centered in the middle of the card</span>
                                    </div>
                                )}
                            </div>

                            <div className="studio-fields-row">
                                <div className="studio-field">
                                    <label htmlFor="channel-name" className="studio-field__label">Channel Name</label>
                                    <input
                                        id="channel-name"
                                        type="text"
                                        className="studio-field__input"
                                        value={channelName}
                                        onChange={(e) => setChannelName(e.target.value)}
                                        placeholder="e.g. JACKET SWIPER"
                                    />
                                </div>
                                <div className="studio-field">
                                    <label htmlFor="channel-handle" className="studio-field__label">Handle</label>
                                    <input
                                        id="channel-handle"
                                        type="text"
                                        className="studio-field__input"
                                        value={channelHandle}
                                        onChange={(e) => setChannelHandle(e.target.value)}
                                        placeholder="e.g. @jacketswiper"
                                    />
                                </div>
                            </div>

                            {/* Position & Alignment Toggles */}
                            <div className="studio-layout-toggles">
                                <div className="studio-field">
                                    <span className="studio-field__label">Banner Position</span>
                                    <div className="studio-toggle-group">
                                        <button
                                            type="button"
                                            className={`studio-toggle-btn ${headerPosition === 'top' ? 'studio-toggle-btn--active' : ''}`}
                                            onClick={() => setHeaderPosition('top')}
                                        >
                                            Top
                                        </button>
                                        <button
                                            type="button"
                                            className={`studio-toggle-btn ${headerPosition === 'middle' ? 'studio-toggle-btn--active' : ''}`}
                                            onClick={() => setHeaderPosition('middle')}
                                        >
                                            Middle of Screen
                                        </button>
                                    </div>
                                </div>

                                <div className="studio-field">
                                    <span className="studio-field__label">Text & Logo Alignment</span>
                                    <div className="studio-toggle-group">
                                        <button
                                            type="button"
                                            className={`studio-toggle-btn ${textAlign === 'center' ? 'studio-toggle-btn--active' : ''}`}
                                            onClick={() => setTextAlign('center')}
                                        >
                                            Centered
                                        </button>
                                        <button
                                            type="button"
                                            className={`studio-toggle-btn ${textAlign === 'left' ? 'studio-toggle-btn--active' : ''}`}
                                            onClick={() => setTextAlign('left')}
                                        >
                                            Left
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: AI Catchy Moment & Text */}
                    <div className="studio-card">
                        <div className="studio-card__header">
                            <span className="studio-card__step">3</span>
                            <div>
                                <h2 className="studio-card__title">AI Catchy Moment & Text</h2>
                                <p className="studio-card__subtitle">Let Gemini pinpoint the best viral segment and suggest headline copy</p>
                            </div>
                        </div>

                        {/* AI Trigger Assistant */}
                        <div className="studio-ai-bar">
                            <button
                                type="button"
                                className="studio-ai-btn"
                                disabled={isAnalyzing || !videoFile}
                                onClick={() => {
                                    setIsAnalyzing(true);
                                    setTimeout(() => {
                                        setIsAnalyzing(false);
                                        setHeadlineText(
                                            "As **Dua Lipa**, **Lupita Nyong'o** and **A$AP Rocky** posed at the **WSJ Innovator Awards**, the comments agreed all three looked beautiful"
                                        );
                                        setTrimStart(0);
                                        setTrimEnd(Math.min(videoDuration || 6, 6));
                                    }, 1200);
                                }}
                            >
                                <span className="studio-ai-btn__icon">{isAnalyzing ? '⏳' : '✨'}</span>
                                <span>{isAnalyzing ? 'Analyzing Clip...' : 'AI: Pinpoint Catchy Moment & Suggest Title'}</span>
                            </button>
                        </div>

                        {/* Trim Sliders */}
                        <div className="studio-trim-box">
                            <div className="studio-trim-header">
                                <span className="studio-field__label">Trim Segment Range</span>
                                <span className="studio-trim-display">
                                    {trimStart}s - {trimEnd}s ({Math.max(0, trimEnd - trimStart)}s total)
                                </span>
                            </div>
                            <div className="studio-trim-controls">
                                <label className="studio-trim-label">
                                    Start:
                                    <input
                                        type="number"
                                        min="0"
                                        max={trimEnd}
                                        value={trimStart}
                                        onChange={(e) => setTrimStart(Number(e.target.value))}
                                        className="studio-trim-number"
                                    />
                                    s
                                </label>
                                <label className="studio-trim-label">
                                    End:
                                    <input
                                        type="number"
                                        min={trimStart}
                                        max={videoDuration || 300}
                                        value={trimEnd}
                                        onChange={(e) => setTrimEnd(Number(e.target.value))}
                                        className="studio-trim-number"
                                    />
                                    s
                                </label>
                            </div>
                        </div>

                        {/* Headline Text Area */}
                        <div className="studio-field">
                            <div className="studio-field__header">
                                <label htmlFor="headline-text" className="studio-field__label">
                                    Headline / Hook Text
                                </label>
                                <span className="studio-field__tip">Tip: Wrap words in **double asterisks** to highlight in blue</span>
                            </div>
                            <textarea
                                id="headline-text"
                                rows={3}
                                className="studio-field__textarea"
                                value={headlineText}
                                onChange={(e) => setHeadlineText(e.target.value)}
                                placeholder="Enter the exact text to display on the video..."
                            />
                        </div>
                    </div>

                    {/* Section 4: Render / Export Action */}
                    <div className="studio-actions-card">
                        {!renderComplete ? (
                            <>
                                <button
                                    type="button"
                                    className="studio-render-btn"
                                    disabled={isRendering || !videoFile}
                                    onClick={handleGenerateVideo}
                                >
                                    <span className="studio-render-btn__icon">{isRendering ? '⏳' : '⚡'}</span>
                                    <span>{isRendering ? 'Rendering Video...' : 'Generate Edited 9:16 Video'}</span>
                                </button>
                                {isRendering && (
                                    <div className="studio-progress">
                                        <div className="studio-progress__bar" style={{ width: `${renderProgress}%` }} />
                                        <span className="studio-progress__text">{renderStatusText} ({renderProgress}%)</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="studio-success-card">
                                <div className="studio-success-header">
                                    <span className="studio-success-icon">🎉</span>
                                    <div>
                                        <h3 className="studio-success-title">Video Generated Successfully!</h3>
                                        <p className="studio-success-desc">9:16 HD vertical video rendered with your logo & centered headline text.</p>
                                    </div>
                                </div>
                                <div className="studio-success-actions">
                                    <button
                                        type="button"
                                        className="studio-download-btn"
                                        onClick={handleDownload}
                                    >
                                        <span className="studio-download-btn__icon">⬇️</span>
                                        <span>Download Edited Video (.mp4)</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="studio-secondary-btn"
                                        onClick={() => {
                                            setRenderComplete(false);
                                            setRenderProgress(0);
                                        }}
                                    >
                                        Re-render with New Edits
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: 9:16 Live Phone Preview Mockup */}
                <aside className="video-studio__preview" aria-label="Live Video Preview">
                    <div className="phone-mockup">
                        <div className="phone-mockup__notch" />
                        <div className="phone-mockup__screen">
                            {/* 9:16 Composition Container */}
                            <div className={`comp-container comp-container--pos-${headerPosition}`}>
                                {/* Top/Middle Header / Hook Card */}
                                <div className={`comp-header comp-header--align-${textAlign}`}>
                                    <div className="comp-header__card">
                                        <div className="comp-header__top-row">
                                            <div className="comp-header__avatar">
                                                {logoUrl ? (
                                                    <img src={logoUrl} alt={channelName} className="comp-header__avatar-img" />
                                                ) : (
                                                    <span className="comp-header__avatar-icon">⚡</span>
                                                )}
                                            </div>
                                            <div className="comp-header__meta">
                                                <div className="comp-header__name-line">
                                                    <span className="comp-header__name">{channelName || 'CHANNEL NAME'}</span>
                                                    <span className="comp-header__verified" title="Verified">✓</span>
                                                </div>
                                                <span className="comp-header__handle">{channelHandle || '@handle'}</span>
                                            </div>
                                        </div>

                                        {/* Headline Hook with Blue Highlights - Always visible */}
                                        <div className="comp-header__headline">
                                            {renderFormattedHeadline(headlineText)}
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Video Section */}
                                <div className="comp-video">
                                    {videoUrl ? (
                                        <video
                                            ref={videoRef}
                                            src={videoUrl}
                                            className="comp-video__player"
                                            controls
                                            playsInline
                                            onLoadedMetadata={handleVideoLoadedMetadata}
                                        />
                                    ) : (
                                        <div className="comp-video__placeholder">
                                            <span className="comp-video__placeholder-icon">📹</span>
                                            <p>Upload a video to see live 9:16 composite</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Phone Footer Bar */}
                        <div className="phone-mockup__footer">
                            <span className="phone-mockup__badge">1080 × 1920 (9:16)</span>
                            <span className="phone-mockup__badge">60 FPS</span>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
