import * as React from 'react'

import { ComponentMeta, ComponentStory } from '@storybook/react'

import { TodoIcon } from '../components/tasktodoicon'

export default {
  title: 'Todo/TodoIcon',
  component: TodoIcon,
}

const Template: ComponentStory<typeof TodoIcon> = (args) => (
  <TodoIcon {...args} />
)

export const Description = Template.bind({})
Description.args = {
  icon: 'description',
}

export const Todos = Template.bind({})
Todos.args = {
  icon: 'todos',
  late: 1,
  soon: 5,
  due: 10,
}
