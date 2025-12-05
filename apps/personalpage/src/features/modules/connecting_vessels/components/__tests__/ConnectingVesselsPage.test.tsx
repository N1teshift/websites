import { render, screen } from '@testing-library/react';
import ConnectingVesselsPage from '../ConnectingVesselsPage';
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

jest.mock('@websites/infrastructure/i18n', () => ({
  useFallbackTranslation: jest.fn(),
}));

type MockImage = {
  src: string;
  alt: string;
  caption?: string;
};

const mockImageCarousel = jest.fn(({ images }: { images: MockImage[] }) => (
  <div data-testid="image-carousel">
    {images.map((image) => (
      <span key={image.src}>{image.alt}</span>
    ))}
  </div>
));

jest.mock('@websites/ui', () => ({
  __esModule: true,
  default: (props: { images: MockImage[] }) => mockImageCarousel(props),
}));

const translationMap: Record<string, string> = {
  project_overview: 'Project Overview',
  project_overview_text: 'Immersive audio installation overview text.',
  role_description: 'Role & Responsibilities',
  role_description_text: 'Role description body copy.',
  photo_gallery: 'Photo Gallery',
  technical_details: 'Technical Details',
  technologies_used: 'Technologies Used',
  technical_implementation: 'Technical Implementation',
  technical_details_text: 'Technical details body text.',
  audio_flow: 'Audio Flow',
  audio_flow_text: 'Audio flow description.',
  open_source: 'Open Source',
  open_source_text: 'Open source body text.',
  github_url: 'https://github.com/example/connecting-vessels',
  github_link: 'View Source',
  raspberry_pi: 'Raspberry Pi',
  darkice: 'Darkice',
  liquidsoap: 'Liquidsoap',
  icecast: 'Icecast',
  mqtt: 'MQTT',
  node_red: 'Node-RED',
  ansible: 'Ansible',
  pulseaudio: 'PulseAudio',
  mpv: 'MPV',
};

describe('ConnectingVesselsPage', () => {
  const mockUseFallbackTranslation = useFallbackTranslation as jest.MockedFunction<typeof useFallbackTranslation>;
  let mockT: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockT = jest.fn((key: string) => translationMap[key] ?? `translated.${key}`);
    mockUseFallbackTranslation.mockReturnValue({ t: mockT });
  });

  it('requests translations from the expected namespaces', () => {
    render(<ConnectingVesselsPage />);
    expect(mockUseFallbackTranslation).toHaveBeenCalledWith(['connecting_vessels', 'links', 'common']);
  });

  it('renders the project overview section with translated content', () => {
    render(<ConnectingVesselsPage />);
    expect(screen.getByRole('heading', { name: 'Project Overview' })).toBeInTheDocument();
    expect(screen.getByText(translationMap.project_overview_text)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Role & Responsibilities' })).toBeInTheDocument();
    expect(screen.getByText(translationMap.role_description_text)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Photo Gallery' })).toBeInTheDocument();
    expect(screen.getByTestId('image-carousel')).toBeInTheDocument();
  });

  it('passes the static gallery images to the carousel component', () => {
    render(<ConnectingVesselsPage />);
    expect(mockImageCarousel).toHaveBeenCalledTimes(1);

    const carouselProps = mockImageCarousel.mock.calls[0][0] as { images: MockImage[] };
    expect(carouselProps.images).toHaveLength(10);
    expect(carouselProps.images[0]).toEqual({
      src: '/images/yaga2025/cube_day.jpg',
      alt: 'Cube sculpture during day',
      caption: 'Cube sculpture installation during daylight',
    });
    expect(carouselProps.images[9]).toEqual({
      src: '/images/yaga2025/rock_night_2.jpg',
      alt: 'Rock sculpture night view 2',
      caption: 'Another view of the rock sculpture at night',
    });
  });

  it('renders the technical details section including technology list', () => {
    render(<ConnectingVesselsPage />);
    expect(screen.getByRole('heading', { name: 'Technical Details' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Technologies Used' })).toBeInTheDocument();
    expect(screen.getByText('Raspberry Pi')).toBeInTheDocument();
    expect(screen.getByText('Node-RED')).toBeInTheDocument();
    expect(screen.getByText('MPV')).toBeInTheDocument();
    expect(screen.getByText(translationMap.technical_details_text)).toBeInTheDocument();
    expect(screen.getByText(translationMap.audio_flow_text)).toBeInTheDocument();
  });

  it('renders the open source section with a GitHub button link', () => {
    render(<ConnectingVesselsPage />);
    expect(screen.getByText(translationMap.open_source_text)).toBeInTheDocument();
    const githubButton = screen.getByRole('link', { name: 'View Source' });
    expect(githubButton).toHaveAttribute('href', translationMap.github_url);
    expect(githubButton).toHaveAttribute('target', '_blank');
    expect(githubButton).toHaveAttribute('rel', 'noopener noreferrer');
  });
});






