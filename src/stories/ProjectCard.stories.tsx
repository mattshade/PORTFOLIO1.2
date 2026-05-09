import type { Meta, StoryObj } from '@storybook/react';
import { ProjectCard } from '../components/Projects';
import { projects } from '../data/projects';

const meta: Meta<typeof ProjectCard> = {
  title: 'Components/ProjectCard',
  component: ProjectCard,
  decorators: [
    (Story) => (
      <div style={{ padding: '3rem', background: '#0a0a0b', minHeight: '100vh', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProjectCard>;

export const Default: Story = {
  args: {
    p: projects[0],
    i: 0,
    onSelect: () => console.log('Project selected'),
  },
};

export const Wide: Story = {
  args: {
    p: { ...projects[0], wide: true },
    i: 1,
    onSelect: () => console.log('Project selected'),
  },
};
