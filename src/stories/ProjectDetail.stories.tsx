import type { Meta, StoryObj } from '@storybook/react';
import { ProjectDetail } from '../components/Projects';
import { projects } from '../data/projects';

const meta: Meta<typeof ProjectDetail> = {
  title: 'Components/ProjectDetail',
  component: ProjectDetail,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProjectDetail>;

export const Default: Story = {
  args: {
    p: projects[0],
    onClose: () => console.log('Closed'),
  },
};

export const WithHero: Story = {
  args: {
    p: projects.find(p => p.modalHero) || projects[0],
    onClose: () => console.log('Closed'),
  },
};
