// Utility to convert content to proper markdown format
export const convertToMarkdown = (content: string[], seenNames: Set<string> = new Set()): string[] => {
  return content.map(paragraph => {
    // Convert uppercase headers to markdown bold
    if (paragraph === paragraph.toUpperCase() && paragraph.length < 100) {
      return `**${paragraph}**`;
    }
    
    let converted = paragraph;
    
    // Convert years in parentheses to bold
    converted = converted.replace(/\((\d{4}(?:-\d{4})?)\)/g, '(**$1**)');
    
    // Convert standalone years to bold
    converted = converted.replace(/\bv roce (\d{4})\b/g, 'v roce **$1**');
    converted = converted.replace(/\b(\d{4})\b/g, '**$1**');
    
    // Convert quoted terms and concepts to italic
    converted = converted.replace(/"([^"]+)"/g, '*$1*');
    
    // Handle names - bold only first occurrence
    const namePattern = /\b([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]+ [A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]+(?:\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]+)?)\b/g;
    converted = converted.replace(namePattern, (match, name) => {
      if (!seenNames.has(name)) {
        seenNames.add(name);
        return `**${name}**`;
      }
      return name;
    });
    
    return converted;
  });
};