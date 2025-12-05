import React from 'react';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import { FiTrash2 } from 'react-icons/fi';
import IconButton from '@/features/infrastructure/shared/components/ui/IconButton';

interface EditableListSectionProps {
  title: string;
  items: string[];
  onAdd: () => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
  addButtonText?: string;
  rows?: number;
}

const EditableListSection: React.FC<EditableListSectionProps> = ({
  title,
  items,
  onAdd,
  onUpdate,
  onRemove,
  placeholder,
  addButtonText,
  rows = 3
}) => {
  const { t } = useFallbackTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-text-primary">
          {title}
        </h4>
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-1 bg-brand text-text-inverse text-sm rounded-md hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand"
        >
          {addButtonText || t('add_item')}
        </button>
      </div>
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start space-x-2">
            <textarea
              value={item}
              onChange={(e) => onUpdate(index, e.target.value)}
              placeholder={placeholder}
              rows={rows}
              className="flex-1 px-3 py-2 border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-brand text-text-primary resize-y"
            />
            <IconButton
              icon={<FiTrash2 size={16} />}
              onClick={() => onRemove(index)}
              color="red"
              size="medium"
              title={t('remove')}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditableListSection;







