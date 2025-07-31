### TL;DR
This is a JavaScript project to create a "Fantasy History Emulator".

### Fantasy History Emulator
The idea is to emulate, and record, the history of humanoid populations over thousands of years.

The core entity will be humanoid units, that could be as small as a handful of them, or grow into an empire of billions of individuals.

The program should be able to track the most important aspects of a population unit, like its name, the number of individuals, the number of individuals in each age group, overall health, overall technology level, overall aggressivity towards other groups, etc.

Within a population unit there is possibility of the apparition of an "influential individual" that has an archetype personality, and can influence change for their group, like creating a new technology, starting a war with another group, starting the groups migration to another area, turning into a religious leader, etc. The notable deeds of these individuals are recorded as part of unit's history.

Finally, the world where these population units live in, is represented by a 2d matrix that has geographical and biome information in every cell: Is it land or water? How much food can a unit find in the area? Predators and monsters that can attack an unit in that area? Type of biome, like deserts, jungles, forests, arable land.

### Step 1
The 1st version of the project is focused on the data structures needed to emulate the growth and history of a population unit. 
