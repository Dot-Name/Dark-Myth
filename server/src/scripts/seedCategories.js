import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Category from '../models/Category.js';

const CATEGORIES = [
  ['Indian Urban Legends', 'Whispered stories from Indian cities, roads and neighbourhoods.'],
  ['Haunted Places', 'Real locations with long, unsettling reputations.'],
  ['Haunted Forts and Palaces', 'Crumbling ramparts, empty halls and the stories they keep.'],
  ['Ghost Stories', 'Spirits, apparitions and tales told after dark.'],
  ['Folklore and Mythology', 'Regional legends and older, stranger myths.'],
  ['Horror Colouring Books', 'Atmospheric illustrations to colour at your own pace.'],
  ['Supernatural Creatures', 'Beings from village tales and forgotten texts.'],
  ['Mystery Collections', 'Unsolved cases and strange happenings, collected together.'],
];
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function run() {
  await connectDB();
  let created = 0;
  for (const [i, [name, description]] of CATEGORIES.entries()) {
    const r = await Category.updateOne({ slug: slugify(name) }, { $setOnInsert: { name, slug: slugify(name), description, displayOrder: i + 1, isActive: true } }, { upsert: true });
    created += r.upsertedCount;
  }
  console.log(`Categories seeded. ${created} created, ${CATEGORIES.length - created} already existed.`);
}

run().catch((e) => { console.error(e.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
