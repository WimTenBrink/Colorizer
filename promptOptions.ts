import { PromptConfig } from './types';

export const PROMPT_CONFIG: PromptConfig = {
  species: [
    { value: "Original", label: "Original", prompt: "" },
    { value: "Human", label: "Human", prompt: "Transform the character into a Human. Add characteristic features of a Human while maintaining the original pose and identity." },
    { value: "Vulcan", label: "Vulcan", prompt: "Transform the character into a Vulcan. Add characteristic features of a Vulcan while maintaining the original pose and identity." },
    { value: "Klingon", label: "Klingon", prompt: "Transform the character into a Klingon. Add characteristic features of a Klingon (ridges on forehead, wild hair) while maintaining the original pose and identity." },
    { value: "Elf", label: "Elf", prompt: "Transform the character into an Elf. Add characteristic features of an Elf (pointed ears, elegant features) while maintaining the original pose and identity." },
    { value: "Half-Elf", label: "Half-Elf", prompt: "Transform the character into a Half-Elf. Add subtle elven features while maintaining the original pose and identity." },
    { value: "Gnome", label: "Gnome", prompt: "Transform the character into a Gnome. Add characteristic features of a Gnome while maintaining the original pose and identity." },
    { value: "Dwarf", label: "Dwarf", prompt: "Transform the character into a Dwarf. Add characteristic features of a Dwarf (stout build, beard if male) while maintaining the original pose and identity." },
    { value: "Halfling", label: "Halfling", prompt: "Transform the character into a Halfling. Add characteristic features of a Halfling while maintaining the original pose and identity." },
    { value: "Mermaid", label: "Mermaid", prompt: "Transform the character into a Mermaid. Replace legs with a fish tail and add aquatic features while maintaining the original pose and identity." },
    { value: "Angel", label: "Angel", prompt: "Transform the character into an Angel. Add large feathered wings and a divine aura while maintaining the original pose and identity." },
    { value: "Demon", label: "Demon", prompt: "Transform the character into a Demon. Add horns, leathery wings, and a sinister aura while maintaining the original pose and identity." }
  ],
  techLevels: [
    { value: "Original", label: "Original", prompt: "" },
    { value: "Primitive", label: "Primitive", prompt: "Transform the setting and artifacts to a primitive, stone-age level. Use natural materials like stone, wood, and bone. Characters should wear furs or simple skins." },
    { value: "Ancient", label: "Ancient", prompt: "Transform the setting to an Ancient era (like Rome, Greece, or Egypt). Use classical architecture, sandals, tunics, and bronze/iron age technology." },
    { value: "Medieval", label: "Medieval", prompt: "Transform the setting to the Medieval period. Use castles, stone masonry, plate or leather armor, swords, and rustic clothing." },
    { value: "Renaissance", label: "Renaissance", prompt: "Transform the setting to the Renaissance period. Focus on ornate clothing, artistic flourishes, early firearms, and classical revival architecture." },
    { value: "Industrial", label: "Industrial", prompt: "Transform the setting to the Early Industrial/Steampunk era. Use steam power, gears, brass, brick factories, and Victorian-style clothing." },
    { value: "Modern", label: "Modern", prompt: "Transform the setting to the Modern day. Use contemporary fashion, smartphones, cars, and modern architecture." },
    { value: "Cyberpunk", label: "Cyberpunk", prompt: "Transform the setting to a Cyberpunk Near Future. Use neon lights, high-tech implants, holograms, dirty high-tech aesthetic, and synthetic materials." },
    { value: "Sci-Fi", label: "Sci-Fi", prompt: "Transform the setting to a clean Sci-Fi Future. Use spaceships, lasers, smooth white surfaces, advanced robotics, and tight-fitting functional suits." },
    { value: "Far Future", label: "Far Future", prompt: "Transform the setting to the Far Future. Use unrecognizable advanced technology, energy beings, organic-tech hybrids, and surreal landscapes." }
  ],
  ageGroups: [
    { value: "Original", label: "Original", prompt: "" },
    { value: "Preteen", label: "Preteen", prompt: "Modify the character's apparent age to be a Preteen. Adjust facial features, skin texture, and body proportions to reflect a Preteen individual while keeping the original identity recognizable." },
    { value: "Teenager", label: "Teenager", prompt: "Modify the character's apparent age to be a Teenager. Adjust facial features, skin texture, and body proportions to reflect a Teenager while keeping the original identity recognizable." },
    { value: "Young Adult", label: "Young Adult", prompt: "Modify the character's apparent age to be a Young Adult. Adjust facial features, skin texture, and body proportions to reflect a Young Adult while keeping the original identity recognizable." },
    { value: "Adult", label: "Adult", prompt: "Modify the character's apparent age to be an Adult. Adjust facial features, skin texture, and body proportions to reflect an Adult while keeping the original identity recognizable." },
    { value: "Middle-Aged", label: "Middle-Aged", prompt: "Modify the character's apparent age to be Middle-Aged. Adjust facial features, skin texture, and body proportions to reflect a Middle-Aged individual while keeping the original identity recognizable." },
    { value: "Elderly", label: "Elderly", prompt: "Modify the character's apparent age to be Elderly. Adjust facial features, skin texture, and body proportions to reflect an Elderly individual while keeping the original identity recognizable." }
  ],
  footwear: [
    { value: "Original", label: "Original", prompt: "" },
    { value: "Barefoot", label: "Barefoot", prompt: "Ensure the character is completely barefoot. Do not draw shoes, socks, or foot coverings." },
    { value: "Sandals", label: "Sandals", prompt: "Ensure the character is wearing Sandals." },
    { value: "Anklets", label: "Anklets", prompt: "Ensure the character is barefoot but wearing decorative anklets." },
    { value: "Clogs", label: "Clogs", prompt: "Ensure the character is wearing Clogs." },
    { value: "Sneakers", label: "Sneakers", prompt: "Ensure the character is wearing Sneakers." },
    { value: "Boots", label: "Boots", prompt: "Ensure the character is wearing Boots." },
    { value: "Shoes", label: "Shoes", prompt: "Ensure the character is wearing Shoes." },
    { value: "Leather Wraps", label: "Leather Wraps", prompt: "Ensure the character is wearing Leather Wraps on their feet." }
  ],
  backgrounds: [
    { value: "Original", label: "Original", prompt: "" },
    { value: "Transparent", label: "Transparent", prompt: "Remove the existing background completely and replace it with a transparent alpha channel. Ensure the output is a RGBA PNG with transparency." },
    { value: "Beach", label: "Beach", prompt: "Replace the entire background with a high-quality, realistic depiction of a Beach. Ensure the lighting, shadows, and reflections on the character match this new Beach environment naturally." },
    { value: "Forest", label: "Forest", prompt: "Replace the entire background with a high-quality, realistic depiction of a Forest. Ensure the lighting, shadows, and reflections on the character match this new Forest environment naturally." },
    { value: "Plains", label: "Plains", prompt: "Replace the entire background with a high-quality, realistic depiction of Plains. Ensure the lighting, shadows, and reflections on the character match this new Plains environment naturally." },
    { value: "Snow", label: "Snow", prompt: "Replace the entire background with a high-quality, realistic depiction of a Snowy landscape. Ensure the lighting, shadows, and reflections on the character match this new Snow environment naturally." },
    { value: "Desert", label: "Desert", prompt: "Replace the entire background with a high-quality, realistic depiction of a Desert. Ensure the lighting, shadows, and reflections on the character match this new Desert environment naturally." },
    { value: "Sea", label: "Sea", prompt: "Replace the entire background with a high-quality, realistic depiction of the Sea. Ensure the lighting, shadows, and reflections on the character match this new Sea environment naturally." },
    { value: "Rivers", label: "Rivers", prompt: "Replace the entire background with a high-quality, realistic depiction of a River. Ensure the lighting, shadows, and reflections on the character match this new Rivers environment naturally." },
    { value: "City", label: "City", prompt: "Replace the entire background with a high-quality, realistic depiction of a City. Ensure the lighting, shadows, and reflections on the character match this new City environment naturally." },
    { value: "Village", label: "Village", prompt: "Replace the entire background with a high-quality, realistic depiction of a Village. Ensure the lighting, shadows, and reflections on the character match this new Village environment naturally." },
    { value: "Spaceship", label: "Spaceship", prompt: "Replace the entire background with a high-quality, realistic depiction of a Spaceship interior. Ensure the lighting, shadows, and reflections on the character match this new Spaceship environment naturally." },
    { value: "Moon", label: "Moon", prompt: "Replace the entire background with a high-quality, realistic depiction of the Moon surface. Ensure the lighting, shadows, and reflections on the character match this new Moon environment naturally." },
    { value: "Mars", label: "Mars", prompt: "Replace the entire background with a high-quality, realistic depiction of Mars. Ensure the lighting, shadows, and reflections on the character match this new Mars environment naturally." },
    { value: "Mountains", label: "Mountains", prompt: "Replace the entire background with a high-quality, realistic depiction of Mountains. Ensure the lighting, shadows, and reflections on the character match this new Mountains environment naturally." },
    { value: "Jungle", label: "Jungle", prompt: "Replace the entire background with a high-quality, realistic depiction of a Jungle. Ensure the lighting, shadows, and reflections on the character match this new Jungle environment naturally." },
    { value: "Castle", label: "Castle", prompt: "Replace the entire background with a high-quality, realistic depiction of a Castle. Ensure the lighting, shadows, and reflections on the character match this new Castle environment naturally." },
    { value: "Library", label: "Library", prompt: "Replace the entire background with a high-quality, realistic depiction of a Library. Ensure the lighting, shadows, and reflections on the character match this new Library environment naturally." },
    { value: "Laboratory", label: "Laboratory", prompt: "Replace the entire background with a high-quality, realistic depiction of a Laboratory. Ensure the lighting, shadows, and reflections on the character match this new Laboratory environment naturally." }
  ],
  clothing: [
    { value: "as-is", label: "As Is (Default)", prompt: "" },
    { value: "more", label: "More Clothing", prompt: "Add more layers of clothing. Ensure the character is well-covered and dressed warmly, adding coats, robes, or full outfits where appropriate." },
    { value: "less", label: "Fewer Clothes", prompt: "Reduce the amount of clothing to be lighter, such as summer wear, swimwear or lighter fabrics, suitable for a tropical environment. Do not generate explicit pornography, but artistic skin exposure is allowed if it fits the context." }
  ]
};