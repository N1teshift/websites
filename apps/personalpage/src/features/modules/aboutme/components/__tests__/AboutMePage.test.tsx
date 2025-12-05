import { render, screen } from '@testing-library/react';
import AboutMePage from '../AboutMePage';
import { useAboutMeData } from '../../hooks';
import type {
  SkillCategory,
  ExperienceItem,
  ProjectItem,
  EducationItem,
  LanguageItem,
} from '../../types';

// Mock the hook
jest.mock('../../hooks', () => ({
  useAboutMeData: jest.fn(),
}));

// Mock react-icons (they render SVG elements we don't need to test)
jest.mock('react-icons/fa', () => ({
  FaLinkedin: () => <span data-testid="linkedin-icon">LinkedIn</span>,
  FaEnvelope: () => <span data-testid="envelope-icon">Email</span>,
}));

const mockUseAboutMeData = useAboutMeData as jest.MockedFunction<typeof useAboutMeData>;

describe('AboutMePage Component', () => {
  // Mock translation function
  const mockT = jest.fn((key: string) => `translated.${key}`);

  // Sample data for tests
  const mockTechSkills: { [key: string]: SkillCategory } = {
    frontend: {
      title: 'Frontend',
      items: ['React', 'TypeScript', 'Next.js'],
    },
    backend: {
      title: 'Backend',
      items: ['Node.js', 'Python'],
    },
  };

  const mockExperience: ExperienceItem[] = [
    {
      title: 'Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      dates: '2020-2023',
      responsibilities: ['Developed features', 'Code reviews'],
    },
  ];

  const mockProjects: ProjectItem[] = [
    {
      title: 'Project 1',
      description: 'A great project',
      technologies: 'React, TypeScript',
    },
  ];

  const mockEducation: EducationItem[] = [
    {
      degree: 'Bachelor of Science',
      institution: 'University Name',
      dates: '2015-2019',
    },
  ];

  const mockLanguages: LanguageItem[] = [
    {
      language: 'English',
      level: 'Native',
    },
    {
      language: 'Spanish',
      level: 'Fluent',
    },
  ];

  const mockInterests = ['Reading', 'Coding', 'Traveling'];
  const mockSoftSkills = ['Communication', 'Teamwork'];

  const defaultMockData = {
    t: mockT,
    techSkills: mockTechSkills,
    experience: mockExperience,
    projects: mockProjects,
    education: mockEducation,
    languages: mockLanguages,
    interests: mockInterests,
    softSkills: mockSoftSkills,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAboutMeData.mockReturnValue(defaultMockData);
  });

  describe('Header Section', () => {
    it('should render without crashing', () => {
      render(<AboutMePage />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should display translated name', () => {
      render(<AboutMePage />);
      expect(screen.getByText('translated.name')).toBeInTheDocument();
    });

    it('should display translated location', () => {
      render(<AboutMePage />);
      expect(screen.getByText('translated.location')).toBeInTheDocument();
    });

    it('should render email link with correct href', () => {
      mockT.mockImplementation((key) => {
        if (key === 'email') return 'test@example.com';
        return `translated.${key}`;
      });

      render(<AboutMePage />);
      const emailLink = screen.getByRole('link', { name: /email/i });
      expect(emailLink).toHaveAttribute('href', 'mailto:test@example.com');
    });

    it('should render LinkedIn link with correct attributes', () => {
      mockT.mockImplementation((key) => {
        if (key === 'linkedin') return 'linkedin.com/in/user';
        if (key === 'linkedinDisplay') return 'LinkedIn Profile';
        if (key === 'linkedinAria') return 'View LinkedIn profile';
        return `translated.${key}`;
      });

      render(<AboutMePage />);
      const linkedInLink = screen.getByRole('link', { name: /linkedin profile/i });
      expect(linkedInLink).toHaveAttribute('href', 'https://linkedin.com/in/user');
      expect(linkedInLink).toHaveAttribute('target', '_blank');
      expect(linkedInLink).toHaveAttribute('rel', 'noopener noreferrer');
      expect(linkedInLink).toHaveAttribute('aria-label', 'View LinkedIn profile');
    });
  });

  describe('Professional Summary Section', () => {
    it('should render summary section', () => {
      render(<AboutMePage />);
      expect(screen.getByText('translated.summaryTitle')).toBeInTheDocument();
      expect(screen.getByText('translated.summaryContent')).toBeInTheDocument();
    });
  });

  describe('Technical Skills Section', () => {
    it('should render technical skills section title', () => {
      render(<AboutMePage />);
      expect(screen.getByText('translated.techSkillsTitle')).toBeInTheDocument();
    });

    it('should render all skill categories', () => {
      render(<AboutMePage />);
      expect(screen.getByText('Frontend')).toBeInTheDocument();
      expect(screen.getByText('Backend')).toBeInTheDocument();
    });

    it('should render all skill items', () => {
      render(<AboutMePage />);
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Next.js')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('Python')).toBeInTheDocument();
    });

    it('should handle empty tech skills', () => {
      mockUseAboutMeData.mockReturnValue({
        ...defaultMockData,
        techSkills: {},
      });

      render(<AboutMePage />);
      expect(screen.getByText('translated.techSkillsTitle')).toBeInTheDocument();
      // Section should still render, just with no cards
    });
  });

  describe('Soft Skills Section', () => {
    it('should render soft skills section title', () => {
      render(<AboutMePage />);
      expect(screen.getByText('translated.softSkillsTitle')).toBeInTheDocument();
    });

    it('should render all soft skills', () => {
      render(<AboutMePage />);
      expect(screen.getByText('Communication')).toBeInTheDocument();
      expect(screen.getByText('Teamwork')).toBeInTheDocument();
    });

    it('should handle empty soft skills array', () => {
      mockUseAboutMeData.mockReturnValue({
        ...defaultMockData,
        softSkills: [],
      });

      render(<AboutMePage />);
      expect(screen.getByText('translated.softSkillsTitle')).toBeInTheDocument();
    });
  });

  describe('Professional Experience Section', () => {
    it('should render experience section title', () => {
      render(<AboutMePage />);
      expect(screen.getByText('translated.experienceTitle')).toBeInTheDocument();
    });

    it('should render experience items', () => {
      render(<AboutMePage />);
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      // Location and dates are rendered together with separator
      expect(screen.getByText(/San Francisco, CA/)).toBeInTheDocument();
      expect(screen.getByText(/2020-2023/)).toBeInTheDocument();
    });

    it('should render experience responsibilities', () => {
      render(<AboutMePage />);
      expect(screen.getByText('Developed features')).toBeInTheDocument();
      expect(screen.getByText('Code reviews')).toBeInTheDocument();
    });

    it('should handle experience without company', () => {
      const experienceWithoutCompany: ExperienceItem[] = [
        {
          title: 'Volunteer',
          location: 'Remote',
          dates: '2020-2021',
          responsibilities: ['Helped with tasks'],
        },
      ];

      mockUseAboutMeData.mockReturnValue({
        ...defaultMockData,
        experience: experienceWithoutCompany,
      });

      render(<AboutMePage />);
      expect(screen.getByText('Volunteer')).toBeInTheDocument();
      // Company should not be rendered
      expect(screen.queryByText('Tech Corp')).not.toBeInTheDocument();
    });

    it('should handle empty experience array', () => {
      mockUseAboutMeData.mockReturnValue({
        ...defaultMockData,
        experience: [],
      });

      render(<AboutMePage />);
      expect(screen.getByText('translated.experienceTitle')).toBeInTheDocument();
    });

    it('should handle experience without responsibilities', () => {
      const experienceWithoutResponsibilities: ExperienceItem[] = [
        {
          title: 'Job Title',
          location: 'Location',
          dates: '2020-2023',
          responsibilities: [],
        },
      ];

      mockUseAboutMeData.mockReturnValue({
        ...defaultMockData,
        experience: experienceWithoutResponsibilities,
      });

      render(<AboutMePage />);
      expect(screen.getByText('Job Title')).toBeInTheDocument();
    });
  });

  describe('Projects Section', () => {
    it('should render projects section title', () => {
      render(<AboutMePage />);
      expect(screen.getByText('translated.projectsTitle')).toBeInTheDocument();
    });

    it('should render project items', () => {
      render(<AboutMePage />);
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('A great project')).toBeInTheDocument();
    });

    it('should handle empty projects array', () => {
      mockUseAboutMeData.mockReturnValue({
        ...defaultMockData,
        projects: [],
      });

      render(<AboutMePage />);
      expect(screen.getByText('translated.projectsTitle')).toBeInTheDocument();
    });
  });

  describe('Education Section', () => {
    it('should render education section title', () => {
      render(<AboutMePage />);
      expect(screen.getByText('translated.educationTitle')).toBeInTheDocument();
    });

    it('should render education items', () => {
      render(<AboutMePage />);
      expect(screen.getByText('Bachelor of Science')).toBeInTheDocument();
      expect(screen.getByText('University Name')).toBeInTheDocument();
      expect(screen.getByText(/2015-2019/)).toBeInTheDocument();
    });

    it('should handle empty education array', () => {
      mockUseAboutMeData.mockReturnValue({
        ...defaultMockData,
        education: [],
      });

      render(<AboutMePage />);
      expect(screen.getByText('translated.educationTitle')).toBeInTheDocument();
    });
  });

  describe('Languages Section', () => {
    it('should render languages section title', () => {
      render(<AboutMePage />);
      expect(screen.getByText('translated.languagesTitle')).toBeInTheDocument();
    });

    it('should render all language items', () => {
      render(<AboutMePage />);
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Native')).toBeInTheDocument();
      expect(screen.getByText('Spanish')).toBeInTheDocument();
      expect(screen.getByText('Fluent')).toBeInTheDocument();
    });

    it('should handle empty languages array', () => {
      mockUseAboutMeData.mockReturnValue({
        ...defaultMockData,
        languages: [],
      });

      render(<AboutMePage />);
      expect(screen.getByText('translated.languagesTitle')).toBeInTheDocument();
    });
  });

  describe('Interests Section', () => {
    it('should render interests section title', () => {
      render(<AboutMePage />);
      expect(screen.getByText('translated.interestsTitle')).toBeInTheDocument();
    });

    it('should render all interests', () => {
      render(<AboutMePage />);
      expect(screen.getByText('Reading')).toBeInTheDocument();
      expect(screen.getByText('Coding')).toBeInTheDocument();
      expect(screen.getByText('Traveling')).toBeInTheDocument();
    });

    it('should handle empty interests array', () => {
      mockUseAboutMeData.mockReturnValue({
        ...defaultMockData,
        interests: [],
      });

      render(<AboutMePage />);
      expect(screen.getByText('translated.interestsTitle')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render all main sections', () => {
      render(<AboutMePage />);

      // Check all section headings exist
      expect(screen.getByText('translated.summaryTitle')).toBeInTheDocument();
      expect(screen.getByText('translated.techSkillsTitle')).toBeInTheDocument();
      expect(screen.getByText('translated.softSkillsTitle')).toBeInTheDocument();
      expect(screen.getByText('translated.experienceTitle')).toBeInTheDocument();
      expect(screen.getByText('translated.projectsTitle')).toBeInTheDocument();
      expect(screen.getByText('translated.educationTitle')).toBeInTheDocument();
      expect(screen.getByText('translated.languagesTitle')).toBeInTheDocument();
      expect(screen.getByText('translated.interestsTitle')).toBeInTheDocument();
    });

    it('should have correct container classes', () => {
      const { container } = render(<AboutMePage />);
      const mainContainer = container.querySelector('.container');
      expect(mainContainer).toHaveClass('mx-auto', 'px-4', 'py-8', 'max-w-4xl');
    });
  });
});




