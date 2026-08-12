import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { MenuPicker } from '../components/orders/MenuPicker';
import { CartPanel } from '../components/orders/CartPanel';
import { OrderMetaFields } from '../components/orders/OrderMetaFields';
import { PricingControls } from '../components/orders/PricingControls';
import { ReceiptView } from '../components/orders/ReceiptView';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { useCustomers } from '../hooks/useCustomers';
import { useStaff } from '../hooks/useStaff';
import { useOrders } from '../hooks/useOrders';
import { CartItem } from '../types';
import { Customer, Product, ProductVariant, Order, PaymentMethod } from '../types/database.types';

export const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentStaff } = useAuth();
  const { categories } = useCategories();
  const { products } = useProducts();
  const { customers, saveCustomer } = useCustomers();
  const { staffList } = useStaff();
  const { createOrder } = useOrders();

  // POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [guestName, setGuestName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('F-7');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState(currentStaff?.id || '');
  const [orderNotes, setOrderNotes] = useState('');

  // Pricing State
  const [discount, setDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(150);
  const [serviceCharges, setServiceCharges] = useState(50);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paidAmount, setPaidAmount] = useState<number | null>(null);

  // Completed Order Thermal Receipt State
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Cart operations
  const handleAddToCart = (product: Product, variant?: ProductVariant) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedVariant?.id === variant?.id
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      } else {
        return [...prev, { product, selectedVariant: variant, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCart((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateNotes = (index: number, notes: string) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[index].notes = notes;
      return updated;
    });
  };

  // Subtotal calculation
  const subtotal = cart.reduce((acc, item) => {
    const price = item.selectedVariant ? item.selectedVariant.price : item.product.base_price;
    return acc + price * item.quantity;
  }, 0);

  const grandTotal = Math.max(0, subtotal - discount + deliveryFee + serviceCharges);

  // Quick New Customer Save
  const handleAddNewCustomer = (custData: {
    full_name: string;
    phone: string;
    address: string;
    area: string;
  }) => {
    saveCustomer.mutate(
      {
        full_name: custData.full_name,
        phone: custData.phone,
        default_address: custData.address,
        default_area: custData.area,
      },
      {
        onSuccess: () => {
          setDeliveryAddress(custData.address);
          setDeliveryArea(custData.area);
          setDeliveryPhone(custData.phone);
        },
      }
    );
  };

  const isMetaValid = Boolean(guestName.trim() && deliveryAddress.trim() && deliveryPhone.trim());

  // Submit Order
  const handleSubmitOrder = async () => {
    if (cart.length === 0 || !isMetaValid) return;

    const items = cart.map((item, idx) => {
      const price = item.selectedVariant ? item.selectedVariant.price : item.product.base_price;
      return {
        id: `item-${Date.now()}-${idx}`,
        order_id: '',
        product_id: item.product.id,
        product_name_snapshot: item.product.name,
        variant_name: item.selectedVariant?.variant_name || null,
        unit_price: price,
        quantity: item.quantity,
        line_total: price * item.quantity,
      };
    });

    let computedPaidAmount: number;
    let computedPaymentStatus: 'paid' | 'unpaid' | 'partial';

    if (paidAmount === null || paidAmount === undefined) {
      computedPaidAmount = grandTotal;
      computedPaymentStatus = 'paid';
    } else if (paidAmount === 0) {
      computedPaidAmount = 0;
      computedPaymentStatus = 'unpaid';
    } else if (paidAmount < grandTotal) {
      computedPaidAmount = paidAmount;
      computedPaymentStatus = 'partial';
    } else {
      computedPaidAmount = paidAmount;
      computedPaymentStatus = 'paid';
    }

    const newOrder = await createOrder.mutateAsync({
      customer_id: selectedCustomer?.id || null,
      customer_name: selectedCustomer?.full_name || guestName || 'Walk-in Guest',
      guest_name: guestName || null,
      created_by_staff: selectedStaffId,
      status: 'preparing',
      delivery_address: deliveryAddress || 'Counter Pickup',
      delivery_area: deliveryArea,
      delivery_phone: deliveryPhone || '+92 300 0000000',
      subtotal,
      discount,
      delivery_fee: deliveryFee,
      service_charges: serviceCharges,
      total: grandTotal,
      payment_method: paymentMethod,
      payment_status: computedPaymentStatus,
      paid_amount: computedPaidAmount,
      notes: orderNotes || null,
      items,
    });

    setCompletedOrder(newOrder);
  };

  const handleResetPos = () => {
    setCart([]);
    setSelectedCustomer(null);
    setGuestName('');
    setDeliveryAddress('');
    setDeliveryArea('F-7');
    setDeliveryPhone('');
    setOrderNotes('');
    setDiscount(0);
    setPaidAmount(null);
    setCompletedOrder(null);
  };

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-6rem)] lg:h-[calc(100vh-6rem)] flex flex-col space-y-4 pb-16 lg:pb-0">
        {/* Title */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-headline-lg font-bold text-xl text-[#e5e2e1] tracking-tight">
              Create Order (POS Terminal)
            </h2>
            <p className="text-xs text-[#9f8d85]">
              Counter & phone order desk for <span className="text-[#e5e2e1] font-bold">NEW orders only</span>. Online website orders are automatically created and should be managed directly from the{' '}
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="text-[#fab895] hover:underline font-bold cursor-pointer inline-flex items-center space-x-0.5"
              >
                <span>Orders Directory</span>
              </button>
              .
            </p>
          </div>
        </div>

        {/* POS Grid: Left Menu Picker (60%), Right Cart & Settlement (40%) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
          {/* Menu Picker (Left 7 cols) */}
          <div className="lg:col-span-7 h-full min-h-0">
            <MenuPicker
              categories={categories}
              products={products}
              cart={cart}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          {/* Cart & Checkout Panel (Right 5 cols) */}
          <div className="lg:col-span-5 h-full min-h-0 flex flex-col space-y-3 overflow-y-auto custom-scrollbar pr-1">
            <OrderMetaFields
              customers={customers}
              staffList={staffList}
              selectedCustomer={selectedCustomer}
              onSelectCustomer={setSelectedCustomer}
              guestName={guestName}
              onChangeGuestName={setGuestName}
              deliveryAddress={deliveryAddress}
              onChangeDeliveryAddress={setDeliveryAddress}
              deliveryArea={deliveryArea}
              onChangeDeliveryArea={setDeliveryArea}
              deliveryPhone={deliveryPhone}
              onChangeDeliveryPhone={setDeliveryPhone}
              selectedStaffId={selectedStaffId}
              onChangeStaffId={setSelectedStaffId}
              orderNotes={orderNotes}
              onChangeOrderNotes={setOrderNotes}
              onAddNewCustomer={handleAddNewCustomer}
            />

            <div className="flex-1 min-h-[220px]">
              <CartPanel
                cart={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onUpdateNotes={handleUpdateNotes}
                onClearCart={() => setCart([])}
              />
            </div>

            <PricingControls
              subtotal={subtotal}
              discount={discount}
              onChangeDiscount={setDiscount}
              deliveryFee={deliveryFee}
              onChangeDeliveryFee={setDeliveryFee}
              serviceCharges={serviceCharges}
              onChangeServiceCharges={setServiceCharges}
              paymentMethod={paymentMethod}
              onChangePaymentMethod={setPaymentMethod}
              paidAmount={paidAmount}
              onChangePaidAmount={setPaidAmount}
              onSubmitOrder={handleSubmitOrder}
              isSubmitting={createOrder.isPending}
              isMetaValid={isMetaValid}
            />
          </div>
        </div>
      </div>

      {/* Thermal Receipt Completion Modal */}
      {completedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="flex flex-col items-center">
            <ReceiptView order={completedOrder} onClose={handleResetPos} />
            <button
              onClick={() => {
                handleResetPos();
                navigate('/orders');
              }}
              className="mt-4 text-xs font-semibold text-[#fab895] hover:text-[#eeae8b] underline"
            >
              Go to All Orders Page
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
