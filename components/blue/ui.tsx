'use client';
import React, { useId } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
export function Choice({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: ([string, string] | string)[];
}) {
  const id = useId();
  const items = options.map((o) =>
    typeof o === 'string'
      ? { value: o, label: o }
      : { value: o[0], label: o[1] },
  );
  return (
    <div className="field">
      <label id={id}>{label}</label>
      <Select
        items={items}
        value={value}
        onValueChange={(v) => v !== null && onChange(v)}
      >
        <SelectTrigger aria-labelledby={id} className="choice">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
export function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} />
    </div>
  );
}
export function TextArea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} {...props} />
    </div>
  );
}
export function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="check">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
export function Modal({
  title,
  description,
  open,
  close,
  children,
}: {
  title: string;
  description?: string;
  open: boolean;
  close: () => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="modal">
        <DialogTitle className="modal-title">{title}</DialogTitle>
        <DialogDescription>
          {description ||
            'Website preview. All changes are demonstration only.'}
        </DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
}
export function ErrorBox({ message }: { message: string }) {
  return message ? (
    <p className="error" role="alert">
      {message}
    </p>
  ) : null;
}
