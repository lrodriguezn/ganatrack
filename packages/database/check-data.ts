import { createClient } from './src/client.js'
import { predios, veterinarios, diagnosticosVeterinarios } from './src/schema/index.js'

const db = createClient()

console.log('=== Checking Predios ===')
const p = await db.select().from(predios).all()
console.log('Count:', p.length)
p.forEach(x => console.log(' -', x.id, x.nombre))

console.log('\n=== Checking Veterinarios ===')
const v = await db.select().from(veterinarios).all()
console.log('Count:', v.length)
v.forEach(x => console.log(' -', x.id, x.nombre, x.predioId))

console.log('\n=== Checking Diagnosticos ===')
const d = await db.select().from(diagnosticosVeterinarios).all()
console.log('Count:', d.length)
d.forEach(x => console.log(' -', x.id, x.nombre))
