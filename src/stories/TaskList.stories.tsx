import * as React from 'react'

import { ComponentMeta, ComponentStory } from '@storybook/react'

import { TaskList } from '../components/TaskList'

export default {
  title: 'Tasks/TaskList',
  component: TaskList,
}

const Template: ComponentStory<typeof TaskList> = (args) => (
  <TaskList {...args} />
)

export const EmptyList = Template.bind({})
EmptyList.args = {
  tasks: [
    {
      title: 'Doing some shit',
    },
  ],
}

// export const Todos = Template.bind({})
// Todos.args = {
//   icon: 'todos',
//   late: 1,
//   soon: 5,
//   due: 10,
// }
