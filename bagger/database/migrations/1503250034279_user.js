'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up() {
    this.create('users', (table) => {
      table.increments()
      table.string('user_id').notNullable().unique()
      table.string('email', 254).notNullable().unique()
      table.string('password', 60).notNullable()
      table.string('verifyToken')
      table.string('resetToken')
      table.boolean('isActive').defaultTo(false)
      table.timestamps()
    })

    this.alter('users', (table) => {
      table.unique('id')
      table.dropPrimary()
      table.primary('user_id')
    })
  }

  down() {
    this.drop('users')
  }
}

module.exports = UserSchema
