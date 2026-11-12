import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
    IconRadar,
    IconX,
    IconYouTube,
    IconInstagram,
    IconTikTok,
    IconFlame,
    IconScissors,
    IconHeart,
    IconSun,
    IconMoon,
    IconSettings,
    IconMenu,
    IconClose,
    IconSearch,
    IconGrid,
    IconCinematic,
    IconPlay,
    IconFilm,
    IconGlobe,
    IconBolt,
    IconEye,
    IconClock,
    IconCalendar,
    IconSparkles,
    IconRefresh,
    IconCheck,
    IconTarget,
    IconTag,
    IconCompass,
    IconComedy,
    IconLaptop,
    IconPopcorn,
    IconTrophy,
    IconMusic,
    IconNewspaper,
    IconLifestyle,
    IconFolder,
    IconAlert,
    IconExternalLink,
    IconChevron,
    IconPalette,
    IconSave,
    IconTrash,
} from '../src/components/common/Icons.jsx';

describe('Icons Component Suite', () => {
    it('renders brand and platform SVG icons without crashing', () => {
        const { container } = render(
            <div>
                <IconRadar size={24} />
                <IconX size={20} />
                <IconYouTube size={20} />
                <IconInstagram size={20} />
                <IconTikTok size={20} />
                <IconFlame size={20} />
                <IconScissors size={20} />
            </div>
        );
        const svgs = container.querySelectorAll('svg');
        expect(svgs.length).toBe(7);
    });

    it('renders utility and category icons with correct classes and sizing', () => {
        const { container } = render(
            <div>
                <IconHeart filled={true} size={18} />
                <IconHeart filled={false} size={18} />
                <IconSun size={18} />
                <IconMoon size={18} />
                <IconSettings size={18} />
                <IconMenu size={18} />
                <IconClose size={18} />
                <IconSearch size={18} />
                <IconGrid size={18} />
                <IconCinematic size={18} />
                <IconPlay size={18} />
                <IconRefresh spinning={true} size={18} />
                <IconCheck size={18} />
                <IconChevron direction="up" size={18} />
                <IconAlert size={18} />
            </div>
        );

        const svgs = container.querySelectorAll('svg');
        expect(svgs.length).toBe(15);
        expect(container.querySelector('.cr-icon--heart-filled')).toBeInTheDocument();
        expect(container.querySelector('.cr-icon--spinning')).toBeInTheDocument();
    });

    it('renders all category icons', () => {
        const { container } = render(
            <div>
                <IconGlobe />
                <IconComedy />
                <IconLaptop />
                <IconPopcorn />
                <IconTrophy />
                <IconMusic />
                <IconNewspaper />
                <IconLifestyle />
                <IconFolder />
                <IconSparkles />
                <IconBolt />
                <IconEye />
                <IconClock />
                <IconCalendar />
                <IconTarget />
                <IconTag />
                <IconCompass />
                <IconExternalLink />
                <IconPalette />
                <IconSave />
                <IconTrash />
            </div>
        );
        const svgs = container.querySelectorAll('svg');
        expect(svgs.length).toBe(21);
    });
});

