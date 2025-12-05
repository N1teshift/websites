export interface ATLCardCategory {
    value: string;
    label: string;
}

export const ATL_CARD_CATEGORIES: ATLCardCategory[] = [
    // Communication
    { value: 'Communication/Communication through language', label: 'Communication/Communication through language' },
    { value: 'Communication/Communication through social media', label: 'Communication/Communication through social media' },
    { value: 'Communication/Exchanging thoughts, messages and information effectively through interaction', label: 'Communication/Exchanging thoughts, messages and information effectively through interaction' },
    { value: 'Communication/Reading, writing and using language to gather and communicate information', label: 'Communication/Reading, writing and using language to gather and communicate information' },
    
    // Self-management
    { value: 'Self-management/Organization skills', label: 'Self-management/Organization skills' },
    { value: 'Self-management/Affective skills', label: 'Self-management/Affective skills' },
    { value: 'Self-management/Reflection skills', label: 'Self-management/Reflection skills' },
    
    // Thinking
    { value: 'Thinking/Critical thinking', label: 'Thinking/Critical thinking' },
    { value: 'Thinking/Creative thinking', label: 'Thinking/Creative thinking' },
    { value: 'Thinking/Transfer skills', label: 'Thinking/Transfer skills' },
    
    // Research
    { value: 'Research/Information literacy skills', label: 'Research/Information literacy skills' },
    { value: 'Research/Media literacy skills', label: 'Research/Media literacy skills' },
    
    // Social
    { value: 'Social/Developing positive interpersonal relationships and collaboration skills', label: 'Social/Developing positive interpersonal relationships and collaboration skills' },
    { value: 'Social/Developing social intelligence to make connections', label: 'Social/Developing social intelligence to make connections' }
];

export const getATLCardCategoryByValue = (value: string): ATLCardCategory | undefined => {
    return ATL_CARD_CATEGORIES.find(category => category.value === value);
};



