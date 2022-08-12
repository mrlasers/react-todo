import * as React from 'react'

import { ComponentMeta as Meta, ComponentStory as Story } from '@storybook/react'

import { DueDatePicker, DueDatePickerProps } from './DueDatePicker'

export default {
  component: DueDatePicker,
  title: 'Button/DueDatePicker',
  artTypes: {
    date: {
      control: 'date',
    },
  },
} as Meta<typeof DueDatePicker>

const Template: Story<typeof DueDatePicker> = (args) => (
  <DueDatePicker {...args} />
)

export const Default = Template.bind({})
Default.args = { date: new Date() }
