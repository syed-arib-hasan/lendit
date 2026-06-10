import AppLayout from '@/components/AppLayout';
import AddItemForm from './AddItemForm';

export default function AddItemPage() {
  return (
    <AppLayout>
      <div className="max-w-xl space-y-6">
        <div>
          <h1 className="page-title">List a new item</h1>
          <p className="text-stone-500 mt-1">Add something you're willing to lend to the community.</p>
        </div>
        <AddItemForm />
      </div>
    </AppLayout>
  );
}
