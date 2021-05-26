'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PersonSchema extends Schema {
  up () {
    this.create('people', (table) => {
      table.increments()
      table.string('person_id').notNullable().references('user_id').inTable('users').onDelete('cascade').onUpdate('cascade')
      table.string('name')
      table.string('username', 80).notNullable().unique()
      table.string('description')
      table.timestamps()
    })
  }

  down () {
    this.drop('people')
  }
}

module.exports = PersonSchema
