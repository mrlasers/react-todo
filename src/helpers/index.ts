export * from './update'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/lib/function'

import { ID, Project, Todo } from '../App'

const adjectives = [
  'Androgynous',
  'Big Booty',
  'Cheesy',
  'Chubby',
  'Chunky',
  'Corny',
  'Crazy',
  'Creepy',
  'Dopey',
  'Electrified',
  'Fast',
  'Fluffy',
  'Funky',
  'Gross',
  'Hefty',
  'Idyllic',
  'Jumpy',
  'Limp',
  'Marvelous',
  'Nosey',
  'Polished',
  'Quiet',
  'Rowdy',
  'Simple',
  'Six-Four',
  'Skinny',
  'Sleepy',
  'Sleezy',
  'Slippery',
  'Smokey',
  'Smooth',
  'Something, Something, Something...',
  'Stinky',
  'That One',
  'Tony the',
  'Twisted',
  'Unique',
  'Voluptuous',
  'Wacky Waving Wild Inflatable',
  'Waxed',
  'Xanthic',
  'Xenial',
  'Xenophobic',
  'Yappy',
  'Yummy',
  'Zany',
  'Zealous',
  'Zephyrous',
  'Zesty',
  'Zippy',
]
const animals = [
  'Anteater',
  'Bear',
  'Bonobo',
  'Booboo',
  'Cat',
  'Cheetah',
  'Chuck',
  'Cougar',
  'Dog',
  'Duck',
  'Elephant',
  'Ferret',
  'Giraffe',
  'Gorilla',
  'Human',
  'Iguana',
  'Ibis',
  'Insect',
  'Impala',
  'Jackal',
  'Kangaroo',
  'Lion',
  'Moose',
  'Newfoundland',
  'Ocelot',
  'Orca',
  'Osprey',
  'Otter',
  'Parrot',
  'Quail',
  'Rabbit',
  'Roddy Piper',
  'Shark',
  'Space Monkey',
  'Spider',
  'Squirrel',
  'T-Rex',
  'Tiger',
  'Turtle',
  'Unicorn',
  'Vixen',
  'Wolf',
  'Xoloitzcuintli',
  'Yetti',
  'Yak',
  'Zebra',
]

export function getRandomName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  const name = adjective + ' ' + animal

  return name
}

export function isMatchId(id: ID) {
  return (item: { id: ID }): boolean => item.id === id
}

export function isMatchProjectId(id: ID) {
  return (item: { projectId: ID }): boolean => item.projectId === id
}

export const sortByTitle = (a: Project, b: Project) =>
  a.title > b.title ? 1 : -1

export const getDateValue = (date?: Date) => {
  const now = date ?? new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()

  return `${year}-${month}-${day}`
}

export function getProjectTodos(todos: Todo[], projectId: ID) {
  return pipe(
    todos,
    A.partition(isMatchProjectId(projectId)),
    ({ right }) => right
  )
}
