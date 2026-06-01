'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CheckIcon from '@mui/icons-material/Check';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import TopBar from '@/components/layout/TopBar';

const PLAN = {
  name: 'Clinic Pro',
  price: '$149',
  interval: 'month',
  seats: 5,
  usedSeats: 4,
  renewsOn: 'July 1, 2026',
  features: [
    'Up to 5 practitioners',
    'Unlimited patients',
    'AI document extraction',
    'Exercise library (300+ exercises)',
    'Program builder',
    'Patient portal & messaging',
    'Chart & SOAPIE notes',
    'Priority support',
  ],
};

const INVOICES = [
  { id: 'inv-006', date: 'Jun 1, 2026', amount: '$149.00', status: 'Paid' },
  { id: 'inv-005', date: 'May 1, 2026', amount: '$149.00', status: 'Paid' },
  { id: 'inv-004', date: 'Apr 1, 2026', amount: '$149.00', status: 'Paid' },
  { id: 'inv-003', date: 'Mar 1, 2026', amount: '$149.00', status: 'Paid' },
  { id: 'inv-002', date: 'Feb 1, 2026', amount: '$149.00', status: 'Paid' },
  { id: 'inv-001', date: 'Jan 1, 2026', amount: '$149.00', status: 'Paid' },
];

const USAGE = [
  { label: 'Active Patients', used: 18, limit: null, unit: 'patients' },
  { label: 'Practitioners', used: 4, limit: 5, unit: 'seats' },
  { label: 'AI Extractions This Month', used: 7, limit: 50, unit: 'extractions' },
  { label: 'Exercise Library', used: 12, limit: null, unit: 'custom exercises added' },
  { label: 'Programs Created', used: 3, limit: null, unit: 'programs' },
];

function SubscriptionTab() {
  return (
    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <Card sx={{ flex: 2, minWidth: 300 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="h6" fontWeight={700}>{PLAN.name}</Typography>
                <Chip label="Active" size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, fontSize: 11 }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {PLAN.price}<Typography component="span" variant="body2" color="text.secondary">/{PLAN.interval}</Typography>
              </Typography>
            </Box>
            <Button variant="outlined" size="small">Change Plan</Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            What's included
          </Typography>
          <Box component="ul" sx={{ pl: 0, mt: 1.5, mb: 2, listStyle: 'none' }}>
            {PLAN.features.map((f) => (
              <Box component="li" key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <CheckIcon sx={{ fontSize: 16, color: '#2E7D32' }} />
                <Typography variant="body2">{f}</Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Renews on</Typography>
              <Typography variant="body2" fontWeight={500}>{PLAN.renewsOn}</Typography>
            </Box>
            <Button size="small" color="error" sx={{ color: 'error.main' }}>Cancel Subscription</Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ flex: 1, minWidth: 240, alignSelf: 'flex-start' }}>
        <CardContent>
          <Typography variant="body2" fontWeight={600} mb={2}>Seats</Typography>
          <Typography variant="h5" fontWeight={700}>{PLAN.usedSeats} / {PLAN.seats}</Typography>
          <Typography variant="caption" color="text.secondary">practitioners on your plan</Typography>
          <LinearProgress
            variant="determinate"
            value={(PLAN.usedSeats / PLAN.seats) * 100}
            sx={{ mt: 1.5, height: 6, borderRadius: 3, bgcolor: '#E0E0E0', '& .MuiLinearProgress-bar': { bgcolor: '#6750A4', borderRadius: 3 } }}
          />
          <Button variant="outlined" size="small" fullWidth sx={{ mt: 2 }}>
            Add Practitioner
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

function PaymentMethodTab() {
  return (
    <Box sx={{ maxWidth: 560 }}>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 1.5, bgcolor: '#F0EDF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCardRoundedIcon sx={{ color: '#6750A4', fontSize: 24 }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" fontWeight={600}>Visa ending in 4242</Typography>
              <Typography variant="caption" color="text.secondary">Expires 08 / 2028</Typography>
            </Box>
            <Chip label="Default" size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main', fontSize: 11 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small">Update Card</Button>
            <Button size="small" color="error">Remove</Button>
          </Box>
        </CardContent>
      </Card>
      <Button variant="contained" disableElevation startIcon={<CreditCardRoundedIcon />}>
        Add Payment Method
      </Button>
      <Typography variant="caption" color="text.secondary" display="block" mt={1.5}>
        Payment processing is secured and encrypted. Your card details are never stored on our servers.
      </Typography>
    </Box>
  );
}

function InvoiceHistoryTab() {
  return (
    <Box sx={{ maxWidth: 720 }}>
      <Card>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 600, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 } }}>
              <TableCell>Invoice</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Receipt</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {INVOICES.map((inv) => (
              <TableRow key={inv.id} sx={{ '&:last-child td': { border: 0 } }}>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>{inv.id}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{inv.date}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{inv.amount}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={inv.status} size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 500, fontSize: 11 }} />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" startIcon={<DownloadRoundedIcon />} sx={{ fontSize: 12 }}>
                    PDF
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}

function UsageStatsTab() {
  return (
    <Box sx={{ maxWidth: 600 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {USAGE.map(({ label, used, limit, unit }) => (
          <Card key={label}>
            <CardContent sx={{ py: '14px !important' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: limit ? 1 : 0 }}>
                <Typography variant="body2" fontWeight={500}>{label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {limit ? `${used} / ${limit} ${unit}` : `${used} ${unit}`}
                </Typography>
              </Box>
              {limit && (
                <LinearProgress
                  variant="determinate"
                  value={Math.min((used / limit) * 100, 100)}
                  sx={{
                    height: 6, borderRadius: 3, bgcolor: '#E0E0E0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: used / limit > 0.85 ? '#F57C00' : '#6750A4',
                      borderRadius: 3,
                    },
                  }}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary" display="block" mt={2}>
        Usage resets on the 1st of each month. AI extractions included with Clinic Pro plan.
      </Typography>
    </Box>
  );
}

const TABS = ['Subscription & Plan', 'Payment Method', 'Invoice History', 'Usage Stats'];

export default function BillingPage() {
  const [tab, setTab] = useState(0);

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Billing' }]} />
      <Box sx={{ pt: '56px', px: 4, py: 4 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>Billing</Typography>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: '1px solid #E0E0E0', mb: 3 }}
          TabIndicatorProps={{ style: { backgroundColor: '#6750A4' } }}
        >
          {TABS.map((t) => (
            <Tab key={t} label={t} sx={{ textTransform: 'none', fontWeight: 500, fontSize: 14, '&.Mui-selected': { color: 'primary.main' } }} />
          ))}
        </Tabs>

        {tab === 0 && <SubscriptionTab />}
        {tab === 1 && <PaymentMethodTab />}
        {tab === 2 && <InvoiceHistoryTab />}
        {tab === 3 && <UsageStatsTab />}
      </Box>
    </>
  );
}
