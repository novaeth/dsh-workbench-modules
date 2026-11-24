import { writeApprovalOf } from '@dsh-workbench/shared/host';
import { DECLARED_TOOLS } from '../declared-tools';
import { creatorDailyMessages as messages } from '../messages';

export function approvalOf() {
  return writeApprovalOf({
    tools: [DECLARED_TOOLS.saveDraft.name],
    reason: '会往小红书草稿箱写一条草稿',
    headline: { zh: messages.zh['creatorDaily.approval.headline'], en: messages.en['creatorDaily.approval.headline'] },
    question: { zh: '会往小红书草稿箱写一条草稿，允许吗？', en: 'This writes one draft to Xiaohongshu. Allow it?' },
    fallback: { zh: '不允许时草稿箱不会有变化。', en: 'Declining leaves the drafts untouched.' },
  });
}
