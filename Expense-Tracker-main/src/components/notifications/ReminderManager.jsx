import { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, Edit, Clock, IndianRupee, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';

export default function ReminderManager() {
  const { reminders, addReminder, deleteReminder, updateReminder } = useNotifications();
  const { currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    type: 'spending_limit',
    description: '',
    amount: '',
    scheduledDate: '',
    scheduledTime: '',
    deliveryMethod: 'in_app',
    email: '',
    phone: ''
  });

  const resetForm = () => {
    setFormData({
      type: 'spending_limit',
      description: '',
      amount: '',
      scheduledDate: '',
      scheduledTime: '',
      deliveryMethod: 'in_app',
      email: '',
      phone: ''
    });
    setEditingReminder(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const reminderData = {
      type: formData.type,
      description: formData.description || getDefaultDescription(formData.type),
      deliveryMethod: formData.deliveryMethod,
      email: formData.deliveryMethod !== 'in_app' ? formData.email : null,
      phone: formData.deliveryMethod === 'sms' ? formData.phone : null
    };

    if (formData.type === 'spending_limit') {
      reminderData.amount = parseFloat(formData.amount);
    } else if (formData.type === 'custom') {
      reminderData.scheduledDate = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString();
    } else if (formData.type === 'daily') {
      reminderData.time = formData.scheduledTime || '17:00'; // Default to 5 PM
    }

    if (editingReminder) {
      updateReminder(editingReminder.id, reminderData);
    } else {
      addReminder(reminderData);
    }

    resetForm();
  };

  const getDefaultDescription = (type) => {
    switch (type) {
      case 'spending_limit':
        return `Alert when spending exceeds ₹${formData.amount}`;
      case 'daily':
        return "Don't forget to add today's spending!";
      case 'custom':
        return formData.description || 'Custom reminder';
      default:
        return 'Reminder';
    }
  };

  const startEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      type: reminder.type,
      description: reminder.description,
      amount: reminder.amount?.toString() || '',
      scheduledDate: reminder.scheduledDate ? reminder.scheduledDate.split('T')[0] : '',
      scheduledTime: reminder.time || (reminder.scheduledDate ? reminder.scheduledDate.split('T')[1]?.substr(0, 5) : '17:00'),
      deliveryMethod: reminder.deliveryMethod || 'in_app',
      email: reminder.email || currentUser?.email || '',
      phone: reminder.phone || ''
    });
    setShowForm(true);
  };

  const formatReminderDisplay = (reminder) => {
    let details = [];
    
    if (reminder.type === 'spending_limit') {
      details.push(`Amount: ₹${reminder.amount}`);
    } else if (reminder.type === 'daily') {
      details.push(`Time: ${reminder.time || '17:00'}`);
    } else if (reminder.type === 'custom') {
      const date = new Date(reminder.scheduledDate);
      details.push(`Date: ${date.toLocaleDateString()}`);
      details.push(`Time: ${date.toLocaleTimeString()}`);
    }
    
    if (reminder.deliveryMethod !== 'in_app') {
      details.push(`Delivery: ${reminder.deliveryMethod === 'email' ? 'Email' : 'SMS'}`);
    }
    
    return details.join(' • ');
  };

  const getReminderIcon = (type) => {
    switch (type) {
      case 'spending_limit':
        return <IndianRupee className="w-4 h-4" />;
      case 'daily':
        return <Clock className="w-4 h-4" />;
      case 'custom':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-foreground">Reminders</h2>
          <p className="text-muted text-sm">Manage your spending reminders and notifications</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Reminder
        </Button>
      </div>

      {/* Reminder Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingReminder ? 'Edit Reminder' : 'Create New Reminder'}</CardTitle>
            <CardDescription>
              Set up reminders to help you track your spending habits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">Reminder Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="bg-background/95 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 border-border shadow-lg">
                    <SelectItem value="spending_limit">Spending Limit Alert</SelectItem>
                    <SelectItem value="daily">Daily Spending Reminder</SelectItem>
                    <SelectItem value="custom">Custom Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'spending_limit' && (
                <div>
                  <Label htmlFor="amount">Spending Limit Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount in rupees"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </div>
              )}

              {formData.type === 'daily' && (
                <div>
                  <Label htmlFor="dailyTime">Reminder Time</Label>
                  <Input
                    id="dailyTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>
              )}

              {formData.type === 'custom' && (
                <>
                  <div>
                    <Label htmlFor="customDate">Reminder Date</Label>
                    <Input
                      id="customDate"
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customTime">Reminder Time</Label>
                    <Input
                      id="customTime"
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter custom reminder message"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="delivery">Delivery Method</Label>
                <Select 
                  value={formData.deliveryMethod} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, deliveryMethod: value }))}
                >
                  <SelectTrigger className="bg-background/95 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 border-border shadow-lg">
                    <SelectItem value="in_app">In-App Only</SelectItem>
                    <SelectItem value="email">In-App + Email</SelectItem>
                    <SelectItem value="sms">In-App + SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.deliveryMethod !== 'in_app' && (
                <>
                  {(formData.deliveryMethod === 'email') && (
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  )}
                  {formData.deliveryMethod === 'sms' && (
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingReminder ? 'Update Reminder' : 'Create Reminder'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Existing Reminders */}
      <div className="space-y-4">
        {reminders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No reminders set up yet</p>
            </CardContent>
          </Card>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {getReminderIcon(reminder.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{reminder.description}</h4>
                      <p className="text-sm text-muted">{formatReminderDisplay(reminder)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={reminder.active} 
                        onCheckedChange={(checked) => updateReminder(reminder.id, { active: checked })}
                      />
                      <span className="text-sm text-muted">
                        {reminder.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(reminder)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteReminder(reminder.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
