import Editor, { 
  BtnBold, 
  BtnItalic, 
  BtnUnderline, 
  BtnStrikeThrough,
  BtnBulletList,
  BtnNumberedList,
  BtnLink,
  BtnClearFormatting,
  BtnUndo,
  BtnRedo,
  Separator,
  Toolbar,
  createButton
} from 'react-simple-wysiwyg';
import { cn } from '@/lib/utils';

// Custom alignment buttons
const BtnAlignLeft = createButton('Alinhar à esquerda', '≡◀', 'justifyLeft');
const BtnAlignCenter = createButton('Centralizar', '≡≡', 'justifyCenter');
const BtnAlignRight = createButton('Alinhar à direita', '▶≡', 'justifyRight');
const BtnAlignJustify = createButton('Justificar', '☰', 'justifyFull');

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    document.execCommand('fontName', false, e.target.value);
  };

  return (
    <div className={cn("rich-text-editor", className)}>
      <Editor
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        containerProps={{
          style: {
            minHeight: '150px',
            borderRadius: '0.5rem',
            border: '1px solid hsl(var(--border))',
            backgroundColor: 'hsl(var(--background))',
          }
        }}
      >
        <Toolbar>
          <BtnUndo />
          <BtnRedo />
          <Separator />
          <select 
            onChange={handleFontChange}
            className="rsw-btn font-selector"
            title="Fonte"
          >
            <option value="">Fonte</option>
            <option value="Arial" style={{ fontFamily: 'Arial' }}>Arial</option>
            <option value="Georgia" style={{ fontFamily: 'Georgia' }}>Georgia</option>
            <option value="Times New Roman" style={{ fontFamily: 'Times New Roman' }}>Times New Roman</option>
            <option value="Verdana" style={{ fontFamily: 'Verdana' }}>Verdana</option>
            <option value="Courier New" style={{ fontFamily: 'Courier New' }}>Courier New</option>
            <option value="Poppins" style={{ fontFamily: 'Poppins' }}>Poppins</option>
            <option value="Cinzel" style={{ fontFamily: 'Cinzel' }}>Cinzel</option>
          </select>
          <Separator />
          <BtnBold />
          <BtnItalic />
          <BtnUnderline />
          <BtnStrikeThrough />
          <BtnClearFormatting />
          <Separator />
          <BtnAlignLeft />
          <BtnAlignCenter />
          <BtnAlignRight />
          <BtnAlignJustify />
          <Separator />
          <BtnBulletList />
          <BtnNumberedList />
          <BtnLink />
        </Toolbar>
      </Editor>
    </div>
  );
}
