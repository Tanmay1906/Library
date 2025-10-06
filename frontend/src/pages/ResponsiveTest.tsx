import React, { useState } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import ResponsiveContainer from '../components/UI/ResponsiveContainer';
import ResponsiveCard from '../components/UI/ResponsiveCard';
import ResponsiveButton from '../components/UI/ResponsiveButton';
import ResponsiveInput from '../components/UI/ResponsiveInput';
import ResponsiveText from '../components/UI/ResponsiveText';
import ResponsiveGrid from '../components/UI/ResponsiveGrid';
import ResponsiveFlex from '../components/UI/ResponsiveFlex';
import ResponsiveSpacing from '../components/UI/ResponsiveSpacing';
import ResponsiveModal from '../components/UI/ResponsiveModal';
import ResponsiveForm from '../components/UI/ResponsiveForm';
import ResponsiveLayout from '../components/UI/ResponsiveLayout';
import { Search, User, Mail, Phone, Heart, Star, BookOpen, Settings } from 'lucide-react';

const ResponsiveTest: React.FC = () => {
  const { isMobile, isTablet, isDesktop, currentBreakpoint } = useResponsive();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Form submitted! Check console for data.');
    console.log('Form Data:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ResponsiveContainer className="py-8">
        {/* Header */}
        <ResponsiveText 
          as="h1" 
          size="4xl" 
          weight="extrabold" 
          color="text-slate-900" 
          align="center"
          className="mb-8"
        >
          Responsive Components Test
        </ResponsiveText>

        {/* Current Breakpoint Info */}
        <ResponsiveCard 
          variant="gradient" 
          className="mb-8"
          title="Current Screen Info"
        >
          <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap="md">
            <div className="text-center">
              <ResponsiveText size="lg" weight="bold" color="text-indigo-600">
                Breakpoint
              </ResponsiveText>
              <ResponsiveText size="sm" color="text-slate-600">
                {currentBreakpoint || 'Unknown'}
              </ResponsiveText>
            </div>
            <div className="text-center">
              <ResponsiveText size="lg" weight="bold" color="text-emerald-600">
                Mobile
              </ResponsiveText>
              <ResponsiveText size="sm" color="text-slate-600">
                {isMobile ? 'Yes' : 'No'}
              </ResponsiveText>
            </div>
            <div className="text-center">
              <ResponsiveText size="lg" weight="bold" color="text-purple-600">
                Tablet
              </ResponsiveText>
              <ResponsiveText size="sm" color="text-slate-600">
                {isTablet ? 'Yes' : 'No'}
              </ResponsiveText>
            </div>
            <div className="text-center">
              <ResponsiveText size="lg" weight="bold" color="text-orange-600">
                Desktop
              </ResponsiveText>
              <ResponsiveText size="sm" color="text-slate-600">
                {isDesktop ? 'Yes' : 'No'}
              </ResponsiveText>
            </div>
          </ResponsiveGrid>
        </ResponsiveCard>

        {/* Responsive Grid Test */}
        <ResponsiveCard 
          variant="elevated" 
          className="mb-8"
          title="Responsive Grid Test"
          subtitle="This grid adapts to different screen sizes"
        >
          <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3, xl: 4 }} gap="lg">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <ResponsiveCard 
                key={item} 
                variant="outlined" 
                padding="md"
                hover
                className="text-center"
              >
                <BookOpen size={32} className="mx-auto mb-2 text-indigo-600" />
                <ResponsiveText size="lg" weight="semibold">
                  Item {item}
                </ResponsiveText>
                <ResponsiveText size="sm" color="text-slate-500">
                  Responsive card content
                </ResponsiveText>
              </ResponsiveCard>
            ))}
          </ResponsiveGrid>
        </ResponsiveCard>

        {/* Responsive Flex Test */}
        <ResponsiveCard 
          variant="glass" 
          className="mb-8"
          title="Responsive Flex Test"
          subtitle="Flex direction changes based on screen size"
        >
          <ResponsiveFlex 
            responsiveDirection={{ 
              default: 'col', 
              sm: 'row' 
            }}
            gap="lg"
            align="center"
            justify="between"
          >
            <ResponsiveCard variant="gradient" padding="sm" className="flex-1">
              <ResponsiveText size="sm" weight="semibold" color="text-slate-700">
                Flex Item 1
              </ResponsiveText>
            </ResponsiveCard>
            <ResponsiveCard variant="gradient" padding="sm" className="flex-1">
              <ResponsiveText size="sm" weight="semibold" color="text-slate-700">
                Flex Item 2
              </ResponsiveText>
            </ResponsiveCard>
            <ResponsiveCard variant="gradient" padding="sm" className="flex-1">
              <ResponsiveText size="sm" weight="semibold" color="text-slate-700">
                Flex Item 3
              </ResponsiveText>
            </ResponsiveCard>
          </ResponsiveFlex>
        </ResponsiveCard>

        {/* Responsive Form Test */}
        <ResponsiveCard 
          variant="default" 
          className="mb-8"
          title="Responsive Form Test"
          subtitle="Form elements adapt to screen size"
        >
          <ResponsiveForm 
            onSubmit={handleSubmit}
            maxWidth="2xl"
            background="glass"
            padding="lg"
          >
            <ResponsiveSpacing gap="md" direction="vertical">
              <ResponsiveInput
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                icon={<User size={20} />}
                placeholder="Enter your full name"
                size="md"
              />
              
              <ResponsiveInput
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                icon={<Mail size={20} />}
                placeholder="Enter your email"
                size="md"
              />
              
              <ResponsiveInput
                label="Phone Number"
                name="phone"
                type="tel"
                icon={<Phone size={20} />}
                placeholder="Enter your phone number"
                size="md"
              />
              
              <ResponsiveFlex 
                direction="row" 
                gap="md"
                responsiveDirection={{ 
                  default: 'col', 
                  sm: 'row' 
                }}
              >
                <ResponsiveButton 
                  variant="primary" 
                  size="lg" 
                  fullWidth
                  type="submit"
                  icon={<Heart size={20} />}
                >
                  Submit Form
                </ResponsiveButton>
                
                <ResponsiveButton 
                  variant="outline" 
                  size="lg" 
                  fullWidth
                  onClick={() => setIsModalOpen(true)}
                  icon={<Settings size={20} />}
                >
                  Open Modal
                </ResponsiveButton>
              </ResponsiveFlex>
            </ResponsiveSpacing>
          </ResponsiveForm>
        </ResponsiveCard>

        {/* Responsive Button Test */}
        <ResponsiveCard 
          variant="gradient" 
          className="mb-8"
          title="Responsive Button Test"
          subtitle="Buttons adapt their size and spacing"
        >
          <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }} gap="md">
            <ResponsiveButton variant="primary" size="sm" fullWidth>
              Small Primary
            </ResponsiveButton>
            <ResponsiveButton variant="secondary" size="md" fullWidth>
              Medium Secondary
            </ResponsiveButton>
            <ResponsiveButton variant="success" size="lg" fullWidth>
              Large Success
            </ResponsiveButton>
            <ResponsiveButton variant="danger" size="xl" fullWidth>
              Extra Large Danger
            </ResponsiveButton>
            <ResponsiveButton variant="outline" size="md" fullWidth>
              Outline Button
            </ResponsiveButton>
            <ResponsiveButton variant="ghost" size="md" fullWidth>
              Ghost Button
            </ResponsiveButton>
          </ResponsiveGrid>
        </ResponsiveCard>

        {/* Responsive Text Test */}
        <ResponsiveCard 
          variant="elevated" 
          className="mb-8"
          title="Responsive Text Test"
          subtitle="Text sizes adapt to screen size"
        >
          <ResponsiveSpacing gap="lg" direction="vertical">
            <ResponsiveText as="h1" size="6xl" weight="extrabold" color="text-slate-900">
              Heading 1 - Extra Large
            </ResponsiveText>
            <ResponsiveText as="h2" size="5xl" weight="bold" color="text-indigo-600">
              Heading 2 - Large
            </ResponsiveText>
            <ResponsiveText as="h3" size="4xl" weight="semibold" color="text-emerald-600">
              Heading 3 - Medium
            </ResponsiveText>
            <ResponsiveText as="p" size="lg" color="text-slate-700">
              This is a responsive paragraph that adapts its size based on the screen size. 
              On mobile devices, it will be smaller, and on desktop devices, it will be larger.
            </ResponsiveText>
            <ResponsiveText as="p" size="sm" color="text-slate-500">
              Small text for captions and additional information.
            </ResponsiveText>
          </ResponsiveSpacing>
        </ResponsiveCard>

        {/* Responsive Layout Test */}
        <ResponsiveLayout 
          background="gradient" 
          padding="lg" 
          rounded="2xl" 
          shadow="xl"
          className="mb-8"
        >
          <ResponsiveText 
            as="h3" 
            size="2xl" 
            weight="bold" 
            color="text-slate-900"
            className="mb-4"
          >
            Responsive Layout Test
          </ResponsiveText>
          <ResponsiveText 
            size="base" 
            color="text-slate-600"
            className="mb-6"
          >
            This layout component provides consistent spacing, background, and styling 
            that adapts to different screen sizes.
          </ResponsiveText>
          <ResponsiveFlex 
            direction="row" 
            gap="md"
            responsiveDirection={{ 
              default: 'col', 
              sm: 'row' 
            }}
          >
            <ResponsiveButton variant="primary" size="md">
              Action 1
            </ResponsiveButton>
            <ResponsiveButton variant="outline" size="md">
              Action 2
            </ResponsiveButton>
          </ResponsiveFlex>
        </ResponsiveLayout>

        {/* Responsive Spacing Test */}
        <ResponsiveCard 
          variant="glass" 
          title="Responsive Spacing Test"
          subtitle="Spacing adapts to screen size"
        >
          <ResponsiveSpacing gap="lg" direction="vertical">
            <ResponsiveText size="base" color="text-slate-700">
              This section demonstrates responsive spacing. The gaps between elements 
              will be smaller on mobile devices and larger on desktop devices.
            </ResponsiveText>
            <ResponsiveGrid cols={{ default: 1, sm: 2 }} gap="md">
              <ResponsiveCard variant="outlined" padding="sm">
                <ResponsiveText size="sm" weight="semibold">
                  Spaced Item 1
                </ResponsiveText>
              </ResponsiveCard>
              <ResponsiveCard variant="outlined" padding="sm">
                <ResponsiveText size="sm" weight="semibold">
                  Spaced Item 2
                </ResponsiveText>
              </ResponsiveCard>
            </ResponsiveGrid>
          </ResponsiveSpacing>
        </ResponsiveCard>
      </ResponsiveContainer>

      {/* Responsive Modal Test */}
      <ResponsiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Responsive Modal Test"
        size="lg"
      >
        <ResponsiveSpacing gap="lg" direction="vertical">
          <ResponsiveText size="base" color="text-slate-700">
            This modal demonstrates responsive behavior. It will be smaller on mobile 
            devices and larger on desktop devices.
          </ResponsiveText>
          <ResponsiveInput
            label="Modal Input"
            placeholder="Enter some text"
            icon={<Search size={20} />}
          />
          <ResponsiveFlex 
            direction="row" 
            gap="md"
            responsiveDirection={{ 
              default: 'col', 
              sm: 'row' 
            }}
          >
            <ResponsiveButton 
              variant="primary" 
              size="md" 
              fullWidth
              onClick={() => setIsModalOpen(false)}
            >
              Close Modal
            </ResponsiveButton>
            <ResponsiveButton 
              variant="outline" 
              size="md" 
              fullWidth
              onClick={() => alert('Action performed!')}
            >
              Perform Action
            </ResponsiveButton>
          </ResponsiveFlex>
        </ResponsiveSpacing>
      </ResponsiveModal>
    </div>
  );
};

export default ResponsiveTest;
