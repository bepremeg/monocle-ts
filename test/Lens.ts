import { Lens } from '../src'
import * as assert from 'assert'

interface Street {
  num: number
  name: string
}
interface Address {
  city: string
  street: Street
}
interface Company {
  name: string
  address: Address
}
interface Employee {
  name: string
  company: Company
}

const employee: Employee = {
  name: 'john',
  company: {
    name: 'awesome inc',
    address: {
      city: 'london',
      street: {
        num: 23,
        name: 'high street'
      }
    }
  }
}

interface Person {
  name: string
  age: number
  rememberMe: boolean
}

const person: Person = { name: 'giulio', age: 44, rememberMe: true }

function capitalize(s: string): string {
  return s.substring(0, 1).toUpperCase() + s.substring(1)
}

describe('Lens', () => {
  it('fromProp', () => {
    const name1 = Lens.fromProp<Person, 'name'>('name')
    assert.strictEqual(name1.get(person), 'giulio')
    assert.strictEqual(name1.modify(capitalize)(person).name, 'Giulio')

    const name2 = Lens.fromProp<Person>()('name')
    assert.strictEqual(name2.get(person), 'giulio')
    assert.strictEqual(name2.modify(capitalize)(person).name, 'Giulio')
  })

  it('fromPath', () => {
    const lens1 = Lens.fromPath<Employee, 'company', 'address', 'street', 'name'>([
      'company',
      'address',
      'street',
      'name'
    ])
    assert.strictEqual(lens1.modify(capitalize)(employee).company.address.street.name, 'High street')
    const lens2 = Lens.fromPath<Employee>()(['company', 'address', 'street', 'name'])
    assert.strictEqual(lens2.modify(capitalize)(employee).company.address.street.name, 'High street')
  })

  it('fromNullableProp', () => {
    interface Outer {
      inner?: Inner
    }

    interface Inner {
      value: number
      foo: string
    }

    const inner1 = Lens.fromNullableProp<Outer, Inner, 'inner'>('inner', { value: 0, foo: 'foo' })
    const value = Lens.fromProp<Inner, 'value'>('value')
    const lens1 = inner1.compose(value)

    assert.deepEqual(lens1.set(1)({}), { inner: { value: 1, foo: 'foo' } })
    assert.strictEqual(lens1.get({}), 0)
    assert.deepEqual(lens1.set(1)({ inner: { value: 1, foo: 'bar' } }), { inner: { value: 1, foo: 'bar' } })
    assert.strictEqual(lens1.get({ inner: { value: 1, foo: 'bar' } }), 1)

    const inner2 = Lens.fromNullableProp<Outer>()('inner', { value: 0, foo: 'foo' })
    const lens2 = inner2.compose(value)
    assert.deepEqual(lens2.set(1)({}), { inner: { value: 1, foo: 'foo' } })
    assert.strictEqual(lens2.get({}), 0)
    assert.deepEqual(lens2.set(1)({ inner: { value: 1, foo: 'bar' } }), { inner: { value: 1, foo: 'bar' } })
    assert.strictEqual(lens2.get({ inner: { value: 1, foo: 'bar' } }), 1)
  })

  it('fromProps', () => {
    const lens = Lens.fromProps<Person>()(['name', 'age'])
    assert.deepEqual(lens.get(person), { name: 'giulio', age: 44 })
    assert.deepEqual(lens.set({ name: 'Guido', age: 47 })(person), { name: 'Guido', age: 47, rememberMe: true })
  })
})
